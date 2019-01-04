import {createSelector} from 'reselect';
import {chars} from '../data/lists'
import * as selectors from './index';

const archetype = state => state.archetype;
const archetypes = state => state.archetypes;
const creationCharacteristics = state => state.creationCharacteristics;
const talentModifiers = state => state.talentModifiers;
const talents = state => state.talents;

export const characteristics = (state) => calcCharacteristics(state);

const calcCharacteristics = createSelector(
	archetype, archetypes, creationCharacteristics, talentModifiers, selectors.equipmentStats, talents, selectors.talentCount,
	(archetype, archetypes, creationCharacteristics, talentModifiers, equipmentStats, talents, talentCount) => {
		if (!archetype || !archetypes[archetype]) return creationCharacteristics;
		//get the starting characteristics
		const characteristics = {...archetypes[archetype]};
		//add the creation characteristics
		Object.keys(characteristics).forEach(characteristic => {
			characteristics[characteristic] += creationCharacteristics[characteristic];
		});
		//add dedications talents
		Object.values(talentModifiers.Dedication).forEach(characteristic => {
			characteristics[characteristic]++;
		});
		//add other talents
		Object.entries(talentCount).forEach(([talent, count]) => {
			if (talents[talent]) {
				if (talents[talent].modifier) {
					chars.forEach(characteristic => {
						if (characteristic in talents[talent].modifier) {
							characteristics[characteristic] += count;
						}
					});
				}
			}
		});
		//add equipment modifier
		Object.keys(equipmentStats).forEach(key => {
			let item = equipmentStats[key];
			if (item.modifier) {
				if (item.carried) {
					if (item.equipped || item.type !== 'armor') {
						let list = item.modifier;
						if (list) {
							Object.keys(list).forEach(modifier => {
								if (chars.includes(modifier)) characteristics[modifier] += 1;
							});
						}
					}
				}
			}
		});

		//Hard cap of 6
		Object.keys(characteristics).forEach(characteristic => {
			if (characteristics[characteristic] > 6) characteristics[characteristic] = 6;
		});
		return characteristics;
	}
);
