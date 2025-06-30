export interface Identifier {
  print(): string;
}

export class Scope {
  private static readonly identifierChars = 'abcdefghijklmnopqrstuvwxyz$_';

  private identifierIndex: number | undefined = undefined;

  constructor(private readonly parent?: Scope) {}

  private nextIdentifierIndex(): number {
    if (this.identifierIndex === undefined) {
      if (this.parent) {
        this.identifierIndex = this.parent.identifierIndex ?? 0;
      } else {
        this.identifierIndex = 0;
      }
    }
    return this.identifierIndex++;
  }

  private pickNextIdentifier(): string {
    const identifierIndex = this.nextIdentifierIndex();
    const identifier = Scope.identifierChars[identifierIndex];
    if (identifier) {
      return identifier;
    }
    return '_' + (identifierIndex - Scope.identifierChars.length);
  }

  public identifier(): Identifier {
    let result: string | undefined = undefined;

    const print = (): string => {
      if (result === undefined) {
        result = this.pickNextIdentifier();
      }
      return result;
    };

    return { print };
  }
}
