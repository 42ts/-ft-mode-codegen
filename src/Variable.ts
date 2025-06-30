export class Variable {
  private identifier: string | undefined;

  private static identifierIndex = 0;
  private static readonly identifiers = 'abcdefghijklmnopqrstuvwxyz$_';

  private constructor(public readonly jsValueEscaped: string) {}

  public static from(jsValueEscaped: string): Variable {
    return new Variable(jsValueEscaped);
  }

  private static pickNextIdentifier(): string {
    const identifier = Variable.identifiers[Variable.identifierIndex++];
    if (identifier) {
      return identifier;
    }
    return '_' + (Variable.identifierIndex - Variable.identifiers.length);
  }

  public print(): string {
    if (this.identifier === undefined) {
      this.identifier = Variable.pickNextIdentifier();
    }
    return this.identifier;
  }
}
