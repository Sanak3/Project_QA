import '@testing-library/jest-dom';

HTMLFormElement.prototype.requestSubmit = function() {
    this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
};