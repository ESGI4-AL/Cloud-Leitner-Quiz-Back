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
    expect(card.id).toBeUndefined();
    expect(card.userId).toBe(userId);
    expect(card.createdAt).toBeInstanceOf(Date);
  });

  it('should set default values when not provided', () => {
    const question = 'Some question';
    const answer = 'Some answer';
    const tag = 'Some tag';

    const card = new Card(undefined, undefined, question, answer, tag);

    expect(card.category).toBe(Category.FIRST);
    expect(card.userId).toBe('default-user-id');
    expect(card.id).toBeUndefined();
    expect(card.createdAt).toBeInstanceOf(Date);
  });

  it('should reset the category to FIRST when resetCategory is called', () => {
    const card = new Card(
      undefined,
      'default-user-id',
      'Some question',
      'Some answer',
      'Some tag',
      Category.SECOND
    );

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
    expect(card.id).toBeUndefined();
    expect(card.createdAt).toBeInstanceOf(Date);
  });

  it('should use the current date as createdAt by default', () => {
    const before = new Date();
    const card = new Card(
      undefined,
      'default-user-id',
      'question',
      'answer',
      'tag'
    );
    const after = new Date();

    expect(card.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(card.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
