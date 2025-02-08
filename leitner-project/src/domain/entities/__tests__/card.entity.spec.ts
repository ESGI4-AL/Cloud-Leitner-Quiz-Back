import { Card } from "../card.entity";
import { Category } from "../category.enum";

describe('Card', () => {
  it('should create a Card with the provided parameters', () => {
    const question = 'What is the capital of France?';
    const answer = 'Paris';
    const tag = 'Geography';
    const category = Category.SECOND;

    const card = new Card(undefined, question, answer, tag, category);

    expect(card.question).toBe(question);
    expect(card.answer).toBe(answer);
    expect(card.tag).toBe(tag);
    expect(card.category).toBe(category);
    expect(card.id).toBeDefined();
  });

  it('should set a default category to FIRST when not provided', () => {
    const card = new Card(undefined, 'Some question', 'Some answer', 'Some tag');

    expect(card.category).toBe(Category.FIRST);
  });

  it('should reset the category to FIRST when resetCategory is called', () => {
    const card = new Card(undefined, 'Some question', 'Some answer', 'Some tag', Category.SECOND);

    card.resetCategory();

    expect(card.category).toBe(Category.FIRST);
  });
});
