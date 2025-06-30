export abstract class Statement {
  private _isActivated: boolean = false;

  protected isActivated(): boolean {
    return this._isActivated;
  }

  public activate(): void {
    this._isActivated = true;
  }

  public abstract print(): string;
  public abstract prepareCurrentScope(): void;
  public abstract prepareInnerScope(): void;
  public prepare(): void {
    if (!this.isActivated()) {
      return;
    }
    this.prepareCurrentScope();
    this.prepareInnerScope();
  }
}
