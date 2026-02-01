import { MentionPipe } from './mention.pipe';

describe('MentionPipe', () => {
  let pipe: MentionPipe;

  beforeEach(() => {
    pipe = new MentionPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform string into mentions', () => {
    expect(pipe.transform('user')).toEqual(['@user']);
    expect(pipe.transform('user friend')).toEqual(['@user', '@friend']);
  });

  it('should not add @ if already present', () => {
    expect(pipe.transform('@user')).toEqual(['@user']);
  });

  it('should handle mixed input', () => {
    expect(pipe.transform('user @friend')).toEqual(['@user', '@friend']);
  });
});
