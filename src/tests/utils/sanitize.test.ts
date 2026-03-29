import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeHTML,
  sanitizeURL,
  sanitizePhone,
  sanitizeEmail,
  sanitizeSearchQuery,
  sanitizeFilename,
  sanitizeNumber,
  sanitizeObject,
  stripHTML,
} from '../../utils/sanitize';

describe('sanitizeText', () => {
  it('should escape HTML characters', () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('should handle empty string', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('should escape quotes', () => {
    expect(sanitizeText('Hello "World"')).toContain('&quot;');
  });
});

describe('sanitizeHTML', () => {
  it('should convert HTML to plain text', () => {
    const result = sanitizeHTML('<p>Hello <b>World</b></p>');
    expect(result).not.toContain('<p>');
    expect(result).not.toContain('<b>');
  });
});

describe('sanitizeURL', () => {
  it('should allow http and https', () => {
    expect(sanitizeURL('https://example.com')).toBe('https://example.com');
    expect(sanitizeURL('http://example.com')).toBe('http://example.com');
  });

  it('should block javascript: protocol', () => {
    expect(sanitizeURL('javascript:alert("xss")')).toBe('');
  });

  it('should block data: protocol', () => {
    expect(sanitizeURL('data:text/html,<script>alert("xss")</script>')).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizeURL('')).toBe('');
  });
});

describe('sanitizePhone', () => {
  it('should remove non-numeric characters', () => {
    expect(sanitizePhone('+971 50 123 4567')).toBe('+971501234567');
  });

  it('should keep leading +', () => {
    expect(sanitizePhone('+123456')).toBe('+123456');
  });

  it('should remove multiple + signs except first', () => {
    expect(sanitizePhone('+123+456')).toBe('+123456');
  });
});

describe('sanitizeEmail', () => {
  it('should convert to lowercase', () => {
    expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
  });

  it('should trim whitespace', () => {
    expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
  });
});

describe('sanitizeSearchQuery', () => {
  it('should remove angle brackets', () => {
    expect(sanitizeSearchQuery('<test>')).toBe('test');
  });

  it('should normalize whitespace', () => {
    expect(sanitizeSearchQuery('hello     world')).toBe('hello world');
  });

  it('should limit length', () => {
    const longQuery = 'a'.repeat(300);
    expect(sanitizeSearchQuery(longQuery).length).toBe(200);
  });
});

describe('sanitizeFilename', () => {
  it('should replace invalid characters', () => {
    expect(sanitizeFilename('my file<>:"|?*.txt')).toBe('my_file_________.txt');
  });

  it('should prevent directory traversal', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('_.._.._.._etc_passwd');
  });

  it('should remove double dots', () => {
    expect(sanitizeFilename('file..name.txt')).toBe('file.name.txt');
  });
});

describe('sanitizeNumber', () => {
  it('should keep only digits and dots', () => {
    expect(sanitizeNumber('$1,234.56')).toBe('1234.56');
  });

  it('should handle negative sign', () => {
    expect(sanitizeNumber('-123')).toBe('123');
  });
});

describe('sanitizeObject', () => {
  it('should sanitize all string values', () => {
    const obj = {
      name: '<script>alert("xss")</script>',
      email: 'test@example.com',
      nested: {
        value: '<b>Bold</b>',
      },
    };

    const result = sanitizeObject(obj);
    expect(result.name).not.toContain('<script>');
    expect(result.nested.value).not.toContain('<b>');
  });

  it('should handle arrays', () => {
    const obj = {
      tags: ['<tag1>', '<tag2>'],
    };

    const result = sanitizeObject(obj);
    expect(result.tags[0]).not.toContain('<');
  });
});

describe('stripHTML', () => {
  it('should remove all HTML tags', () => {
    expect(stripHTML('<p>Hello <b>World</b></p>')).toBe('Hello World');
  });

  it('should handle empty string', () => {
    expect(stripHTML('')).toBe('');
  });

  it('should handle nested tags', () => {
    expect(stripHTML('<div><p><span>Text</span></p></div>')).toBe('Text');
  });
});
