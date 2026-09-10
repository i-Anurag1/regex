import pytest
from app.compiler.pipeline import compile_regex
from app.automata.simulator import simulate

@pytest.mark.parametrize('regex,accepted,rejected',[
    ('a',['a'],['','b','aa']),
    ('a|b',['a','b'],['','c']),
    ('(a|b)*abb',['abb','aabb','abababb'],['ab','aba','abc']),
    ('[a-c]+',['a','abc','cc'],['','d','abcd']),
    (r'\d+',['123','0'],['','12a']),
    ('a{2,4}',['aa','aaa','aaaa'],['a','aaaaa']),
    ('a{2,}',['aa','aaaaaa'],['a','b']),
    (r'^a+$',['a','aaa'],['','ba','ab']),
    (r'a\*b',['a*b'],['ab','a**b']),
    ('.+',['abc','A1'],['']),
    ('epsilon',[''],['a']),
])
def test_language(regex,accepted,rejected):
    c=compile_regex(regex)
    for s in accepted: assert simulate(c['minimized_dfa'],s)['accepted'], (regex,s)
    for s in rejected: assert not simulate(c['minimized_dfa'],s)['accepted'], (regex,s)

def test_invalid_regexes():
    for r in ['', '(', 'a|', '*a', '[', '[z-a]', 'a{4,2}', 'a{101}', '^a^', 'a$b']:
        with pytest.raises(ValueError): compile_regex(r)

def test_dfa_deterministic_and_minimized():
    c=compile_regex('(a|b)*abb')
    seen=set()
    for e in c['dfa']['transitions']:
        key=(e['from'],e['symbol']); assert key not in seen; seen.add(key)
    assert c['minimized_dfa']['states']
