const Injectable = (): ClassDecorator => () => undefined;

@Injectable()
export class DiFooService {
  run(): number {
    return 1;
  }
}
