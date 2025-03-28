export class RandomString {
    static readonly SEED_DIGITS = "0123456789";
    static readonly SEED_UPPER_CASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static readonly SEED_LOWER_CASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
  
    static generate(seed: string, amountOfChars: number): string {
      if (amountOfChars < 1) {
        throw new Error("The amount of chars should be >= 1");
      }
      if (seed.length === 0) {
        throw new Error("The seed cannot be empty");
      }
  
      const randomString: string[] = [];
      const random = new Random();
      
      for (let i = 0; i < amountOfChars; i++) {
        randomString.push(seed[random.nextInt(seed.length)]);
      }
  
      return randomString.join("");
    }
  }
  
  class Random {
    private seed: number;
  
    constructor() {
      this.seed = Date.now() - 1024 * 8;
    }
  
    nextInt(max: number): number {
      this.seed = (this.seed * 9301 + 49297) % 233280;
      return Math.floor((this.seed / 233280) * max);
    }
  }
  