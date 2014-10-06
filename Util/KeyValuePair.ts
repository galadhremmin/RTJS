
export class KeyValuePair {
    
  constructor(private key: string, private value: any, private container?: any) {
      
  }

  public getKey(): string {
    return this.key;
  }

  public getValue(): any {
    return this.value;
  }

  public getContainer(): any {
    return this.container;
  }

}
 