export abstract class Snippet {
  private _isActivated: boolean = false;

  protected isActivated(): boolean {
    return this._isActivated;
  }

  public activate(): void {
    this._isActivated = true;
  }

  public abstract print(): string;
}
