import abstractGetter from 'getter/abstract/abstract';
import ChancesGetter from 'getter/chances';
import PronounGetter from 'getter/pronoun';
import AdjectiveGetter from 'getter/adjective';

import nounsTxt from 'corpus/nouns.txt';

import pluralize from 'pluralize';

const defaultOptions = {
	type: 'thing'
};

export default class ThingGetter extends abstractGetter {

	constructor(defaults={},options={}) {

		options = Object.assign({},defaultOptions,options);
		super(defaults,options);

		this.nouns = this.parse(nounsTxt);

		this.chances = this.buildGetter(ChancesGetter);

	}


	isSingular(noun) {
		if(
			noun.props.proper ||
			noun.props.singular === 'always' ||
			(this.options.type === 'ownable' && noun.props.singular === 'owned') ||
			(this.options.type === 'thing' && noun.props.singular === 'thing')
		) {
			return true;
		}
		if(
			noun.props.plural === 'always' ||
			(this.options.type === 'ownable' && noun.props.plural === 'owned') ||
			(this.options.type === 'thing' && noun.props.plural === 'thing')
		) {
			return false;
		}
		else {
			return this.chances.should('isSingular');
		}
	}


	shouldUseAdjective(noun) {
		if(noun.props.proper) {
			return false;
		}
		else {
			return this.chances.should('useAdjective');
		}
	}


	getDefault() {

		const wordList = (()=>{
			let list = this.nouns;
			if(this.options.type === 'thing') {
				list = list.filter(noun => !noun.props.only || noun.props.only !== 'ownable');
			}
			else if (this.options.type === 'ownable') {
				list = list.filter(noun => !noun.props.only || noun.props.only !== 'proper');
			}
			if(this.options.singular === true) {
				list = list.filter(noun => this.isSingular(noun));
			}
			if(this.options.plural === true) {
				list = list.filter(noun => !this.isSingular(noun));
			}
			return list;
		})();
		const noun = this.expand(this.randomArray(wordList));

		const useAdjective = this.shouldUseAdjective(noun);
		const isSingular = this.isSingular(noun);

		const usePronoun = (()=>{
			return this.options.type === 'thing' && noun.props.proper != true;
		})();

		let returnable = [];

		if(useAdjective) {
			returnable.push(this.buildGetter(AdjectiveGetter).value);
			if(this.chances.should('useTwoAdjectives')){
				returnable.push(this.buildGetter(AdjectiveGetter).value);
			}
		}

		if(isSingular) {
			returnable.push(noun.value);
		}
		else {
			returnable.push(pluralize(noun.value,2));
		}

		if(usePronoun) {
			returnable.unshift(this.buildGetter(PronounGetter,{},{
				singular: isSingular,
				pronounable: returnable[0]
			}).value);
		}

		return returnable.filter(val => val.length > 0).join(' ');

	}

}
