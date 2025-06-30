import assert from 'node:assert/strict';
import test from 'node:test';
import { Identifier, Scope } from '../src/Scope';
import { Statement } from '../src/Statement';

const MyStatement = class extends Statement {
  private readonly scope: Scope;
  private readonly innerScope: Statement;
  private readonly a: Identifier;
  private readonly b: Identifier;
  private readonly _: Identifier;

  constructor() {
    super();
    this.scope = new Scope();
    this.a = this.scope.identifier();
    this._ = this.scope.identifier();
    const outerScope = this.scope;
    this.innerScope = new (class extends Statement {
      private readonly scope: Scope;
      private readonly c: Identifier;
      private readonly d: Identifier;

      constructor() {
        super();
        this.scope = new Scope(outerScope);
        this.c = this.scope.identifier();
        this.d = this.scope.identifier();
      }

      public prepareCurrentScope(): void {
        this.c.print();
        this.d.print();
      }

      public prepareInnerScope(): void {}

      public print(): string {
        return this.c.print() + this.d.print();
      }
    })();
    this.b = this.scope.identifier();
  }

  public prepareCurrentScope(): void {
    this.a.print();
    this.b.print();
  }

  public prepareInnerScope(): void {
    this.innerScope.prepare();
  }

  public print(): string {
    return this.a.print() + this.b.print() + this.innerScope.print();
  }
};

test('generated identifiers are unique', () => {
  const statement = new MyStatement();
  statement.prepare();
  assert.strictEqual(statement.print(), 'abcd');
});
