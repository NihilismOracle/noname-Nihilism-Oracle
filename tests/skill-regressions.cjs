// Run: node --experimental-vm-modules --test tests/skill-regressions.cjs
// Exercises the real extension callbacks with a small engine fixture, not a live match.
// Event contracts checked against libnoname/noname v1.11.6.1,
// commit 0b7e4be4b6ef64ab8579b2ffc643a2a626e4fede:
// apps/core/noname/library/element/{player.js,content.ts}.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const card = (name, color = 'none') => ({ name, color });

async function fixture() {
    const context = vm.createContext({});
    vm.runInContext('Array.prototype.addArray = function(items) { for (const item of items) if (!this.includes(item)) this.push(item); return this; };', context);
    const lib = { skill: {}, filter: { notMe: (card, player, target) => player !== target } };
    const game = { players: [], countPlayer() { return this.players.length; } };
    const get = {
        name: card => card.name,
        color: card => card.color,
        tag: (card, tag) => tag === 'damage' && ['sha', 'juedou', 'nanman', 'wanjian', 'huogong'].includes(card.name),
        prompt: (skill, target) => `${skill}:${target.name}`,
        effect: (target, card, actor, viewer) => {
            assert.equal(actor, viewer);
            target.scoredCard = card.name;
            return target.effect ?? 1;
        },
        value: card => card.value ?? 0,
        translation: item => item.name,
    };
    const values = { lib, game, get, ui: {}, ai: {}, _status: {} };
    const engine = new vm.SyntheticModule(Object.keys(values), function() {
        for (const [name, value] of Object.entries(values)) this.setExport(name, value);
    }, { context });
    for (const pack of ['zshy002', 'zshy004']) {
        const filename = path.join(root, 'character', pack, 'skill.js');
        const module = new vm.SourceTextModule(await fs.readFile(filename, 'utf8'), { context, identifier: filename });
        await module.link(specifier => {
            assert.equal(specifier, '../../../../noname.js');
            return engine;
        });
        await module.evaluate();
        Object.assign(lib.skill, module.namespace.default);
    }
    return { lib, game, get, context };
}

function choice(result) {
    return { options: {}, set(key, value) { this.options[key] = value; return this; }, async forResult() { return result; } };
}

function caiwangActors() {
    const target = {
        name: 'other', discardable: 1, gainable: 1,
        countDiscardableCards(player, zone) { assert.equal(zone, 'he'); return this.discardable; },
        countGainableCards(player, zone) { assert.equal(zone, 'he'); return this.gainable; },
    };
    const player = {
        name: 'owner', marks: [], calls: [], accept: true,
        getStorage() { return this.marks; },
        chooseBool(...args) { this.prompt = args; this.decision = choice({ bool: this.accept }); return this.decision; },
        logSkill() {},
        async discardPlayerCard(who, zone, forced) { this.calls.push(['discard', who, zone, forced]); },
        async gainPlayerCard(who, zone, forced) { this.calls.push(['gain', who, zone, forced]); },
        async chooseDrawRecover(forced) { this.calls.push(['drawRecover', forced]); },
    };
    return { player, target };
}

async function activateCaiwang(skill, trigger, player) {
    if (!skill.filter(trigger, player)) return false;
    const event = {};
    await skill.cost(event, trigger, player);
    if (!event.result.bool) return false;
    await skill.content(event, trigger, player);
    return true;
}

for (const responding of ['red', 'black', 'none']) {
    for (const original of ['red', 'black', 'none']) {
        test(`才望: ${responding}/${original}, both response directions`, async () => {
            const { lib } = await fixture();
            const skill = lib.skill.zshy_caiwang;
            for (const ownResponse of [true, false]) {
                const { player, target } = caiwangActors();
                const trigger = { player: ownResponse ? player : target, card: card('shan', responding), respondTo: [ownResponse ? target : player, card('sha', original)] };
                assert.equal(await activateCaiwang(skill, trigger, player), true);
                if (responding === original) {
                    assert.deepEqual(player.calls, [['discard', target, 'he', true]]);
                    assert.match(player.prompt[1], /弃置.*手牌或装备牌/);
                } else {
                    assert.deepEqual(player.calls, [['drawRecover', true]]);
                    assert.equal(player.prompt, undefined, 'different colors cannot be declined');
                }
            }
        });
    }
}

test('才望: different colors work against an empty-handed ally; same colors require a legal card', async () => {
    const { lib } = await fixture();
    const skill = lib.skill.zshy_caiwang;
    const { player, target } = caiwangActors();
    target.discardable = target.gainable = 0;
    target.effect = -1;
    const trigger = { player, card: card('shan', 'red'), respondTo: [target, card('sha', 'black')] };
    assert.equal(skill.check(trigger, player), true);
    assert.equal(await activateCaiwang(skill, trigger, player), true);
    trigger.card.color = 'black';
    assert.equal(await activateCaiwang(skill, trigger, player), false);
});

test('才望: cancellation and a target losing its last card cause no discard', async () => {
    const { lib } = await fixture();
    const skill = lib.skill.zshy_caiwang;
    const { player, target } = caiwangActors();
    const trigger = { player, card: card('shan', 'red'), respondTo: [target, card('sha', 'red')] };
    player.accept = false;
    assert.equal(await activateCaiwang(skill, trigger, player), false);
    assert.deepEqual(player.calls, []);
    player.accept = true;
    const event = {};
    await skill.cost(event, trigger, player);
    target.discardable = 0;
    await skill.content(event, trigger, player);
    assert.deepEqual(player.calls, []);
});

test('才望: 纳降 changes eligibility, prompt, action and AI to gaining a card', async () => {
    const { lib } = await fixture();
    const skill = lib.skill.zshy_caiwang;
    const { player, target } = caiwangActors();
    player.marks.push(target);
    target.discardable = 0;
    const trigger = { player, card: card('shan', 'black'), respondTo: [target, card('sha', 'black')] };
    assert.equal(await activateCaiwang(skill, trigger, player), true);
    assert.deepEqual(player.calls, [['gain', target, 'he', true]]);
    assert.match(player.prompt[1], /获得/);
    assert.equal(player.decision.options.ai(), true);
    assert.equal(target.scoredCard, 'shunshou_copy2');
    target.effect = -1;
    assert.equal(player.decision.options.ai(), false);
    target.gainable = 0;
    assert.equal(skill.filter(trigger, player), false);
});

test('才望: optional discard AI follows benefit, including beneficial removal from an ally', async () => {
    const { lib } = await fixture();
    const { player, target } = caiwangActors();
    const trigger = { player, card: card('shan', 'red'), respondTo: [target, card('sha', 'red')] };
    for (const effect of [-1, 0, 1]) {
        target.effect = effect;
        assert.equal(lib.skill.zshy_caiwang.check(trigger, player), effect > 0);
        assert.equal(target.scoredCard, 'guohe_copy2');
    }
});

test('才望: unrelated uses, self-responses and other players responding to each other are excluded', async () => {
    const { lib } = await fixture();
    const { player, target } = caiwangActors();
    for (const trigger of [
        { player, card: card('sha') },
        { player, card: card('shan'), respondTo: [player, card('sha')] },
        { player: target, card: card('shan'), respondTo: [{}, card('sha')] },
    ]) assert.equal(lib.skill.zshy_caiwang.filter(trigger, player), false);
});

test('往烈: first damage card across all phases; extra phases do not reset; next turn resets', async () => {
    const { lib } = await fixture();
    const skill = lib.skill.zshy_wanglie;
    let history = [];
    const player = { getHistory(type, filter) { assert.equal(type, 'useCard'); return history.filter(filter); } };
    const first = card('sha'), second = card('sha'), trick = card('juedou');
    assert.equal(skill.mod.targetInRange(first, player), true);
    assert.equal(skill.mod.targetInRange(card('guohe'), player), undefined);
    history.push({ card: card('tao') });
    assert.equal(skill.mod.targetInRange(trick, player), true);
    // A damage card used outside the play phase consumes the same turn's first use.
    history.push({ card: first });
    assert.equal(skill.mod.targetInRange(second, player), undefined);
    assert.equal(skill.mod.targetInRange(trick, player), undefined);
    assert.equal(skill.mod.targetInRange(first, player), true, 'adding targets to the first card retains its range benefit');
    assert.equal(skill.mod.targetInRange(second, player), undefined, 'an extra play phase retains turn history');
    history = [];
    assert.equal(skill.mod.targetInRange(second, player), true);
});

test('往烈: damage used before gaining the skill still consumes the first card', async () => {
    const { lib } = await fixture();
    const player = { getHistory: () => [{ card: card('juedou') }] };
    assert.equal(lib.skill.zshy_wanglie.mod.targetInRange(card('sha'), player), undefined);
});

for (const [ownLost, targetLosses, baseEffects, expected] of [[2, [1, 3], 1, 7], [0, [0], 1, 2], [1, [2, 4, 0], 2, 8]]) {
    test(`往烈: lost HP ${ownLost}/${targetLosses}, extra effects added once to ${baseEffects}`, async () => {
        const { lib, game, context } = await fixture();
        const skill = lib.skill.zshy_wanglie;
        const player = { getDamagedHp: () => ownLost };
        const targets = targetLosses.map(n => ({ getDamagedHp: () => n }));
        const bystander = {};
        game.players = [player, ...targets, bystander];
        const useEvent = { targets, effectCount: baseEffects, directHit: vm.runInContext('[]', context) };
        const trigger = { card: card('nanman'), isFirstTarget: true, getParent: () => useEvent };
        assert.ok(skill.filter(trigger, player), 'no own-turn or play-phase requirement');
        await skill.content({}, trigger, player);
        assert.equal(useEvent.effectCount, expected);
        assert.equal(useEvent.nowuxie, true);
        assert.deepEqual(Array.from(useEvent.directHit), game.players);
        trigger.isFirstTarget = false;
        assert.equal(skill.filter(trigger, player), false, 'remaining targets cannot multiply the bonus again');
        trigger.isFirstTarget = true;
        trigger.card = card('guohe');
        assert.equal(skill.filter(trigger, player), false);
    });
}

test('往烈: AI only reports damage cards as unanswerable', async () => {
    const { lib } = await fixture();
    const ai = lib.skill.zshy_wanglie.ai;
    assert.equal(ai.skillTagFilter({}, 'directHit_ai', { card: card('sha') }), true);
    assert.equal(ai.skillTagFilter({}, 'directHit_ai', { card: card('guohe') }), false);
    assert.equal(ai.skillTagFilter({}, 'directHit_ai', undefined), false);
    assert.notEqual(ai.skillTagFilter({}, 'presha', undefined), false);
});

function yongsiPlayer(lib, selected) {
    const player = {
        storage: {}, tempSkills: {}, calls: [], hand: selected, selected,
        async draw(num) { this.calls.push(['draw', num]); },
        getCards(zone, filter) { assert.equal(zone, 'h'); return this.hand.filter(filter); },
        canRecast(card) { return !card.blocked; },
        chooseCard(prompt, zone, range) {
            assert.equal(zone, 'h');
            assert.match(prompt, /手牌/);
            this.range = Array.from(range);
            this.choice = choice({ bool: !!this.selected.length, cards: this.selected });
            return this.choice;
        },
        async recast(cards) { this.calls.push(['recast', cards]); if (this.duringRecast) this.duringRecast(); },
        addTempSkill(name, expire) { this.tempSkills[name] = expire; },
        expire(signal) {
            for (const [name, expiry] of Object.entries(this.tempSkills)) {
                if (!expiry.global.includes(signal)) continue;
                delete this.tempSkills[name];
                if (lib.skill[name].onremove === true) delete this.storage[name];
            }
        },
    };
    return player;
}

test('庸肆: draw X, recast hand cards, count all damage cards, apply benefit after recasting', async () => {
    const { lib, game } = await fixture();
    game.players = [{}, {}, {}];
    const player = yongsiPlayer(lib, [card('sha'), card('juedou'), card('tao')]);
    player.duringRecast = () => assert.equal(player.storage.zshy_yongsi_sha, undefined);
    await lib.skill.zshy_yongsi.content({}, {}, player);
    assert.deepEqual(player.calls[0], ['draw', 3]);
    assert.deepEqual(player.range, [0, 3]);
    assert.equal(player.choice.options.filterCard({ blocked: true }, player), false);
    assert.equal(player.storage.zshy_yongsi_sha, 2);
    assert.equal(lib.skill.zshy_yongsi.mod.maxHandcard(player, 4), 7);
    const mod = lib.skill.zshy_yongsi_sha.mod;
    assert.equal(mod.cardUsable(card('sha'), player, 1), 3);
    assert.equal(mod.cardUsable(card('juedou'), player, 1), undefined);
    assert.equal(mod.targetInRange(card('sha'), player), true);
    assert.equal(mod.targetInRange(card('guohe'), player), undefined);
    assert.equal(mod.attackRange, undefined, 'unrelated attack-range mechanics remain unchanged');
});

for (const selected of [[], [card('tao')]]) {
    test(`庸肆: ${selected.length ? 'non-damage recast' : 'declining recast'} grants no bonus`, async () => {
        const { lib, game } = await fixture();
        game.players = [{}, {}];
        const player = yongsiPlayer(lib, selected);
        player.hand = selected.length ? selected : [card('sha')];
        await lib.skill.zshy_yongsi.content({}, {}, player);
        assert.equal(player.storage.zshy_yongsi_sha, undefined);
        assert.deepEqual(Object.keys(player.tempSkills), []);
    });
}

test('庸肆: no recastable hand cards still draws X', async () => {
    const { lib, game } = await fixture();
    game.players = [{}, {}];
    const player = yongsiPlayer(lib, [{ name: 'sha', blocked: true }]);
    await lib.skill.zshy_yongsi.content({}, {}, player);
    assert.deepEqual(player.calls, [['draw', 2]]);
    assert.equal(player.choice, undefined);
});

test('庸肆: persists through extra phases and end phase, then clears at turn boundary', async () => {
    const { lib, game } = await fixture();
    game.players = [{}, {}];
    const player = yongsiPlayer(lib, [card('sha')]);
    await lib.skill.zshy_yongsi.content({}, {}, player);
    for (const signal of ['phaseUseEnd', 'phaseUseBegin', 'phaseUseEnd', 'phaseJieshuBegin']) {
        player.expire(signal);
        assert.equal(player.storage.zshy_yongsi_sha, 1);
        assert.ok(player.tempSkills.zshy_yongsi_sha);
    }
    player.expire('phaseAfter');
    assert.equal(player.storage.zshy_yongsi_sha, undefined);
    assert.equal(player.tempSkills.zshy_yongsi_sha, undefined);
    await lib.skill.zshy_yongsi.content({}, {}, player);
    player.expire('phaseBeforeStart');
    assert.equal(player.storage.zshy_yongsi_sha, undefined, 'interrupted turns cannot leak the bonus');
});

test('庸肆: extra preparation phases preserve and accumulate bonuses within the same turn', async () => {
    const { lib, game } = await fixture();
    game.players = [{}, {}];
    const player = yongsiPlayer(lib, [card('sha')]);
    await lib.skill.zshy_yongsi.content({}, {}, player);
    player.selected = [];
    await lib.skill.zshy_yongsi.content({}, {}, player);
    assert.equal(player.storage.zshy_yongsi_sha, 1);
    player.selected = [card('juedou')];
    player.hand = player.selected;
    await lib.skill.zshy_yongsi.content({}, {}, player);
    assert.equal(player.storage.zshy_yongsi_sha, 2);
    player.expire('phaseAfter');
    assert.equal(player.storage.zshy_yongsi_sha, undefined);
});
