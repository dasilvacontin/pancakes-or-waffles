import abstractGetter from 'getter/abstract/abstract';
import people from 'json-loader!yaml-loader!corpus/people.yaml';

export default class CharacterGetter extends abstractGetter {

	constructor(defaults={}) {
		super(defaults);
		this.people = people;

		if(defaults.fandom) {
			let revised = this.people.filter(chara => chara.fandom === defaults.fandom);
			if(revised.length > 0) this.people = revised;
		}
		if(defaults.skipName) {
			let revised = this.people.filter(chara => chara.name !== defaults.skipName);
			if(revised.length > 0) this.people = revised;
		}
	}


	get values() {
		return this.randomArray(this.people);
	}


}
