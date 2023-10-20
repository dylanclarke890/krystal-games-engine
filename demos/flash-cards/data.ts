export class FlashCardData {
  question: string;
  answer: string;
  showAnswer: boolean;

  constructor(question: string, answer: string) {
    this.question = question;
    this.answer = answer;
    this.showAnswer = false;
  }

  get content(): string {
    return this.showAnswer ? this.answer : this.question;
  }
}
