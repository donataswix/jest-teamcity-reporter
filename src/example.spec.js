describe('Suite A', () => {
    it.skip('ignored test', () => {

    });

    it('passing test', () => {
        expect(1).toBe(1);
    });
});

describe('Suite B', () => {
    it('failing test', () => {
        expect(0).toBe(1);
    });
});
