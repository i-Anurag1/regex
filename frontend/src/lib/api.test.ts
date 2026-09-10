import {describe,it,expect} from 'vitest'; describe('API helpers',()=>{it('exports compile function',async()=>{const m=await import('./api'); expect(typeof m.compileRegex).toBe('function')})});
