// Métodos públicos que NO cuentan hacia el límite porque son callbacks del
// framework (NestJS): los llama el container/router/HTTP layer, nunca el
// código de negocio. Contarlos forzaría refactors sin semántica.
export const nestFrameworkHookNames = [
  // Lifecycle hooks — https://docs.nestjs.com/fundamentals/lifecycle-events
  "onModuleInit",
  "onModuleDestroy",
  "onApplicationBootstrap",
  "onApplicationShutdown",
  "beforeApplicationShutdown",
  // Interfaces del request pipeline
  "canActivate", // CanActivate (Guard)
  "intercept", // NestInterceptor
  "transform", // PipeTransform
  "catch", // ExceptionFilter
  "use", // NestMiddleware
];
