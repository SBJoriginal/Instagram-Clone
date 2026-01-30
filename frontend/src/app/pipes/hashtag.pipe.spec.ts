import { HashtagPipe } from './hashtag.pipe';

describe('HashtagPipe', () => {
  let pipe: HashtagPipe;

  beforeEach(() => {
    pipe = new HashtagPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform string into hashtags', () => {
    expect(pipe.transform('test')).toEqual(['#test']);
    expect(pipe.transform('test two')).toEqual(['#test', '#two']);
  });

  it('should not add # if already present', () => {
    expect(pipe.transform('#test')).toEqual(['#test']);
  });

  it('should handle mixed input', () => {
    expect(pipe.transform('test #two')).toEqual(['#test', '#two']);
  });
});
