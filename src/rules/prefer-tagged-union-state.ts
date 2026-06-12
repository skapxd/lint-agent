import { getContainingFunction } from "#/utils/ast/get-containing-function";
import { getStateShapeSmell } from "#/utils/react/get-state-shape-smell";
import { getTaggedUnionStateOptions } from "#/utils/options/get-tagged-union-state-options";
import { getUseStateSetterName } from "#/utils/react/get-use-state-setter-name";
import { getUseStateVariableName } from "#/utils/react/get-use-state-variable-name";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matching/matches-any-pattern";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

type StateMachineEntry = {
  errorNames: string[];
  loadingNames: string[];
  reportNode: RuleNode;
};

type TransitionEntry = {
  reportNode: RuleNode;
  states: Map<string, string>;
};

export const preferTaggedUnionState: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe estados inconsistentes representables: flags booleanos + campos de error independientes se modelan como union etiquetada.",
    },
    messages: {
      inconsistentStateShape:
        "Este estado declara `{{flag}}` y `{{error}}` como miembros independientes: las combinaciones imposibles (en proceso Y con error, error Y con valor) son representables — y si esto es un schema, la inconsistencia se PERSISTE. Modela una union etiquetada: `{ status: \"idle\" } | { status: \"processing\" } | { status: \"error\"; error: E } | { status: \"ok\"; value: T }`. Cada variante carga SOLO los datos que existen en ese estado, y `match().exhaustive()` obliga a manejar todas.",
      splitStateMachine:
        "Esta funcion reparte UNA maquina de estados entre varios useState ({{names}}): cada transicion toca varios setters y los renders intermedios ven combinaciones imposibles. Usa UN useState con una union etiquetada (`{ status: \"loading\" } | { status: \"error\"; error: E } | ...`) o un useReducer: la transicion se vuelve atomica y `match()` la consume exhaustiva.",
      splitTransition:
        "Esta funcion llama a varios setters de useState en una sola transicion ({{names}}): eso PRUEBA que esos estados son una sola maquina repartida — entre setter y setter, los renders intermedios ven combinaciones imposibles. Consolida en UN useState con union etiquetada (o useReducer) para que la transicion sea atomica.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          errorPatterns: {
            items: { type: "string" },
            type: "array",
          },
          loadingPatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getTaggedUnionStateOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    // useState repartidos, agrupados por función contenedora.
    const stateMachines = new Map<RuleNode, StateMachineEntry>();
    // setter → nombre del estado que gobierna (identificado por POSICIÓN
    // en el destructuring, no por nombre: evidencia estructural).
    const settersToState = new Map<string, string>();
    // transiciones: función → setters distintos que llama.
    const transitions = new Map<RuleNode, TransitionEntry>();

    function reportIfSmellyShape(node: RuleNode, members: readonly RuleNode[]) {
      const smell = getStateShapeSmell(members, options);

      if (smell) {
        context.report({
          data: smell,
          messageId: "inconsistentStateShape",
          node,
        });
      }
    }

    function trackTransition(node: RuleNode) {
      const stateName = settersToState.get(node.callee?.name);
      const containingFunction = getContainingFunction(node);

      const lacksTrackedStateOwner = !stateName || !containingFunction;
      if (lacksTrackedStateOwner) {
        return;
      }

      const entry = transitions.get(containingFunction) ?? {
        reportNode: node,
        states: new Map(),
      };

      entry.states.set(node.callee.name, stateName);
      entry.reportNode = node;
      transitions.set(containingFunction, entry);
    }

    function classifyUseState(node: RuleNode) {
      const hasIdentifierCallee = node.callee?.type === "Identifier";
      if (!hasIdentifierCallee) {
        return;
      }

      const callsUseState = node.callee.name === "useState";
      if (!callsUseState) {
        trackTransition(node);

        return;
      }

      const setterName = getUseStateSetterName(node);

      if (setterName) {
        settersToState.set(setterName, getUseStateVariableName(node) ?? setterName);
      }

      const stateName = getUseStateVariableName(node);
      const containingFunction = getContainingFunction(node);

      const lacksTrackedSetterOwner = !stateName || !containingFunction;
      if (lacksTrackedSetterOwner) {
        return;
      }

      const entry = stateMachines.get(containingFunction) ?? {
        errorNames: [],
        loadingNames: [],
        reportNode: node,
      };

      const comparableName = stateName.toLowerCase();

      const matchesAllowedPattern = matchesAnyPattern(comparableName, options.loadingPatterns);
      if (matchesAllowedPattern) {
        entry.loadingNames.push(stateName);
      }

      const matchesErrorPattern = matchesAnyPattern(comparableName, options.errorPatterns);
      if (matchesErrorPattern) {
        entry.errorNames.push(stateName);
        entry.reportNode = node;
      }

      stateMachines.set(containingFunction, entry);
    }

    return {
      CallExpression: classifyUseState,
      "Program:exit"() {
        for (const entry of stateMachines.values()) {
          const lacksLoadingErrorPair = entry.loadingNames.length === 0 || entry.errorNames.length === 0;
          if (lacksLoadingErrorPair) {
            continue;
          }

          context.report({
            data: {
              names: [...entry.loadingNames, ...entry.errorNames].join(", "),
            },
            messageId: "splitStateMachine",
            node: entry.reportNode,
          });
        }

        // Evidencia ESTRUCTURAL: una función que llama a 2+ setters
        // distintos ejecuta una transición repartida. El filtro por nombre
        // (algún estado loading/error-ish) descarta los co-updates
        // legítimos de campos independientes (resetear un formulario).
        for (const entry of transitions.values()) {
          const stateNames = [...entry.states.values()];
          const looksLikeMachine = stateNames.some((name: string) => {
            const comparable = name.toLowerCase();

            return (
              matchesAnyPattern(comparable, options.loadingPatterns) ||
              matchesAnyPattern(comparable, options.errorPatterns)
            );
          });

          const lacksCoordinatedStateTransition = entry.states.size < 2 || !looksLikeMachine;
          if (lacksCoordinatedStateTransition) {
            continue;
          }

          context.report({
            data: { names: stateNames.join(", ") },
            messageId: "splitTransition",
            node: entry.reportNode,
          });
        }
      },
      // La versión OOP de la máquina repartida: una clase con el flag y el
      // error como propiedades (un job runner, un schema de Mongoose que
      // persiste la inconsistencia).
      ClassBody(node: RuleNode) {
        reportIfSmellyShape(node.parent, node.body);
      },
      TSInterfaceBody(node: RuleNode) {
        reportIfSmellyShape(node.parent, node.body);
      },
      TSTypeLiteral(node: RuleNode) {
        reportIfSmellyShape(node, node.members);
      },
    };
  },
};
