import { Card } from "../card.entity";
import { Category } from "../category.enum";

describe('Card', () => {
  it('should create a Card with the provided parameters', () => {
    const id = undefined;
    const userId = 'default-user-id';
    const question = 'What is the capital of France?';
    const answer = 'Paris';
    const tag = 'Geography';
    const category = Category.SECOND;

    const card = new Card(id, userId, question, answer, tag, category);

    expect(card.question).toBe(question);
    expect(card.answer).toBe(answer);
    expect(card.tag).toBe(tag);
    expect(card.category).toBe(category);
    expect(card.id).toBeDefined();
    expect(card.userId).toBe(userId);
  });

  it('should set a default category to FIRST when not provided', () => {
    const id = undefined;
    const userId = 'default-user-id';
    const question = 'Some question';
    const answer = 'Some answer';
    const tag = 'Some tag';

    const card = new Card(id, userId, question, answer, tag);

    expect(card.category).toBe(Category.FIRST);
  });

  it('should reset the category to FIRST when resetCategory is called', () => {
    const id = undefined;
    const userId = 'default-user-id';
    const question = 'Some question';
    const answer = 'Some answer';
    const tag = 'Some tag';
    const category = Category.SECOND;

    const card = new Card(id, userId, question, answer, tag, category);
    card.resetCategory();

    expect(card.category).toBe(Category.FIRST);
  });

  it('should create a card using the static create method', () => {
    const userId = 'test-user';
    const question = 'Test question';
    const answer = 'Test answer';
    const tag = 'Test tag';

    const card = Card.create(userId, question, answer, tag);

    expect(card.userId).toBe(userId);
    expect(card.question).toBe(question);
    expect(card.answer).toBe(answer);
    expect(card.tag).toBe(tag);
    expect(card.category).toBe(Category.FIRST);
    expect(card.id).toBeDefined();
  });
});
