export interface Node {
  print(): string;
}

export class RawNode implements Node {
  constructor(private code: string) {}
  print(): string {
    return this.code;
  }
}

export class FunctionNode implements Node {
  constructor(public params: string[], public body: Node[]) {}
  print(): string {
    return `(function(${this.params.join(',')}){${this.body
      .map((b) => b.print())
      .join('')}})`;
  }
}

export class IdentifierManager {
  private index = 0;
  next(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const id = chars[this.index] ?? `_${this.index}`;
    this.index++;
    return id;
  }
}

export class VariableManager {
  params: string[] = [];
  args: string[] = [];
  constructor(private idm: IdentifierManager) {}
  create(argument: string): string {
    const id = this.idm.next();
    this.params.push(id);
    this.args.push(argument);
    return id;
  }
}
