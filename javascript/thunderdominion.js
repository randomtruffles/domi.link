---
---

var ranks = {{ site.data.thunderdominion | jsonify }};

var dispOrder = ['Base', 'Intrigue', 'Seaside', 'Alchemy', 'Prosperity', 'Cornucopia + Guilds', 'Hinterlands', 'Dark Ages', 'Adventures', 'Adventures Events', 'Empires', 'Empires Events', 'Nocturne', 'Renaissance', 'Renaissance Projects', 'Menagerie', 'Menagerie Events', 'Menagerie Ways', 'Allies', 'Allies Allies', 'Promos'];

var mixed = {'Cornucopia': ['Tournament','Remake','Hunting Party','Menagerie','Horn of Plenty','Hamlet','Farming Village','Young Witch','Jester','Fairgrounds','Horse Traders','Fortune Teller','Harvest'], 'Guilds': ['Butcher','Stonemason','Herald','Plaza','Advisor','Doctor','Journeyman','Merchant Guild','Soothsayer','Baker','Candlestick Maker','Masterpiece','Taxman']};

var notes = {
	'Adventures Events': "In 2018 and 2019, Adventures and Empires events were ranked together. The rankings displayed here for those years reflect the ranking within expansion.",
	'Empires Events': "In 2018 and 2019, Adventures and Empires events were ranked together. The rankings displayed here for those years reflect the ranking within expansion.",
	'Cornucopia + Guilds': "In 2018 and 2019, Cornucopia and Guilds were ranked separately. The rankings displayed here for those years and reflect those rankings and the differences for 2020 reflect the in-expansion differences."
}

var wrapper = document.getElementById('wrapper');
var charts = {};

loadPage();

function loadPage() {
	for (let expansion of dispOrder) {
		//calculate expanded ranks
		let expCards = Object.keys(ranks[expansion]).filter(x => x !== 'year');
		for (card of expCards) {
			ranks[expansion][card] = {'rank': ranks[expansion][card], 'diff': []};
		}
		if (expansion == 'Adventures Events' || expansion == 'Empires Events') {
			for (let y = 2018; y < 2020; y++) {
				let placement = ranks[expansion].year.indexOf(y);
				expCards.sort((a,b) => ranks[expansion][a].rank[placement] - ranks[expansion][b].rank[placement]);
				for (let i=0; i<expCards.length; i++) {
					ranks[expansion][expCards[i]]['rank'][placement] = i+1;
				}
			}
		}
		if (expansion == 'Cornucopia + Guilds') {
			for (let i = 0; i < ranks[expansion]['year'].length-1; i++) {
				if (ranks[expansion]['year'][i] == 2020) {
					let corn = mixed['Cornucopia'].sort((a,b) => ranks[expansion][a].rank[i] - ranks[expansion][b].rank[i]);
					let guilds = mixed['Guilds'].sort((a,b) => ranks[expansion][a].rank[i] - ranks[expansion][b].rank[i]);
					for (card of expCards) {
						if (ranks[expansion][card].rank[i] == -1 || ranks[expansion][card].rank[i+1] == -1) {
							ranks[expansion][card].diff.push(null);
						} else {
							if (mixed['Cornucopia'].includes(card)) {
								ranks[expansion][card].diff.push(ranks[expansion][card].rank[i+1] - corn.indexOf(card) - 1);
							} else {
								ranks[expansion][card].diff.push(ranks[expansion][card].rank[i+1] - guilds.indexOf(card) - 1);
							}
							
						}
					}
				} else {
					for (card of expCards) {
						if (ranks[expansion][card].rank[i] == -1 || ranks[expansion][card].rank[i+1] == -1) {
							ranks[expansion][card].diff.push(null);
						} else {
							ranks[expansion][card].diff.push(ranks[expansion][card].rank[i+1] - ranks[expansion][card].rank[i]);
						}
					}
				}
			}
		} else if (expansion == 'Promos') {
			for (let i = 0; i < ranks[expansion]['year'].length-1; i++) {
				if (ranks[expansion]['year'][i] == 2019) {
					let reduced = expCards.filter(c => ranks[expansion][c].rank[i+1] !== -1).sort((a,b) => ranks[expansion][a].rank[i] - ranks[expansion][b].rank[i]);
					for (card of expCards) {
						if (ranks[expansion][card].rank[i] == -1 || ranks[expansion][card].rank[i+1] == -1) {
							ranks[expansion][card].diff.push(null);
						} else {
							ranks[expansion][card].diff.push(ranks[expansion][card].rank[i+1] - reduced.indexOf(card) - 1);
						}
					}
				} else {
					for (card of expCards) {
						if (ranks[expansion][card].rank[i] == -1 || ranks[expansion][card].rank[i+1] == -1) {
							ranks[expansion][card].diff.push(null);
						} else {
							ranks[expansion][card].diff.push(ranks[expansion][card].rank[i+1] - ranks[expansion][card].rank[i]);
						}
					}
				}
			}
		} else {
			for (let i = 0; i < ranks[expansion]['year'].length-1; i++) {
				if (ranks[expansion]['year'][i] == '2E Hot') {
					for (card of expCards) {
						ranks[expansion][card].diff.push(null);
					}
				} else {
					for (card of expCards) {
						if (ranks[expansion][card].rank[i+1] == -1 || ranks[expansion][card].rank[i] == -1) {
							ranks[expansion][card].diff.push(null);
						} else {
							ranks[expansion][card].diff.push(ranks[expansion][card].rank[i+1] - ranks[expansion][card].rank[i]);
						}
					}
				}
			}
		}
		
		ranks[expansion].year = ranks[expansion].year.map(y => String(y));
		
		//header
		let ediv = document.createElement('div');
		ediv.appendChild(document.createElement('hr'));
		let ename = document.createElement('h3');
		ename.appendChild(document.createTextNode(expansion));
		ediv.appendChild(ename);
		wrapper.appendChild(ediv);
		if (expansion in notes) {
			let enote = document.createElement('p');
			enote.appendChild(document.createTextNode(notes[expansion]));
			ediv.appendChild(enote);
		}
		
		//table
		let tabdiv = document.createElement('div');
		tabdiv.classList.add('thundertable-wrapper');
		let tab = document.createElement('table');
		tab.id = expansion.toLowerCase().replace(/ /g, '-') + "-table";
		tab.classList.add('thundertable');
		tab.appendChild(renderTable(expansion, ranks[expansion]['year'][0], false));
		tabdiv.appendChild(tab);
		ediv.appendChild(tabdiv);
		
		//chart
		let chartdiv = document.createElement('div');
		chartdiv.classList.add('thunderchart-wrapper');
		let chart = document.createElement('div');
		chart.id = expansion.toLowerCase().replace(/ /g, '-').replace('+', '') + "-chart";
		chartdiv.appendChild(chart);
		ediv.appendChild(chartdiv);
		renderChart(expansion);
	}
}

function renderTable(expansion, sortBy, desc) {
	let etable = document.createElement('tbody');
	let ethead = document.createElement('tr');
	let descriptor = document.createElement('th');
	descriptor.classList.add('card-cell');
	descriptor.appendChild(document.createTextNode(expansion == "Dark Ages" ? "Card" : (expansion.includes(" ") ? (expansion == "Allies Allies" ? "Ally" : expansion.split(" ")[1].slice(0, -1)) : "Card")));
	ethead.appendChild(descriptor);
	for (y of ranks[expansion].year.slice().reverse()) {
		let year = document.createElement('th');
		year.onclick = sortTable;
		year.classList.add('rank-cell');
		year.appendChild(document.createTextNode(y + (y == sortBy ? (desc ? '▼' : '▲') : '')));
		ethead.appendChild(year);
		if (!y.includes('Hot') && y != '2018' && !(expansion == "Menagerie Ways" && y == 2020)) {
			let pm = document.createElement('th');
			pm.onclick = sortTable;
			pm.classList.add('diff-cell');
			pm.appendChild(document.createTextNode('+/-' + (y == (sortBy.includes(' diff') && sortBy.split(' ')[0]) ? (desc ? '▼' : '▲') : '')));
			ethead.appendChild(pm);
		}
	}
	etable.appendChild(ethead);
	let cardOrder = Object.keys(ranks[expansion]).filter(x => x !== 'year');
	if (sortBy.includes('diff')) {
		let orderIndex = ranks[expansion]['year'].indexOf(sortBy.split(' ')[0]);
		cardOrder.sort((a,b) => {
			let da = ranks[expansion][a].diff[orderIndex];
			let db = ranks[expansion][b].diff[orderIndex];
			if (da === db) {
				return 0;
			} else if (da === null) {
				return 1;
			} else if (db === null) {
				return -1;
			} else {
				return (desc ? -1 : 1) * (da - db);
			}
		});
	} else {
		let orderIndex = ranks[expansion]['year'].indexOf(sortBy);
		cardOrder.sort((a,b) => {
			let ra = ranks[expansion][a].rank[orderIndex];
			let rb = ranks[expansion][b].rank[orderIndex];
			if (ra == rb) {
				return 0;
			} else if (ra == -1) {
				return 1;
			} else if (rb == -1) {
				return -1;
			} else {
				return (desc ? -1 : 1) * (ra - rb);
			}
		});
	}
	for (card of cardOrder) {
		let row = document.createElement('tr');
		let name = document.createElement('td');
		name.classList.add('card-cell');
		name.appendChild(document.createTextNode((expansion == "Menagerie Ways" ? "Way of the " : "") + card));
		row.appendChild(name);
		for (let i = ranks[expansion].year.length-1; i >=0; i--) {
			let r = document.createElement('td');
			r.classList.add('rank-cell');
			r.appendChild(document.createTextNode(ranks[expansion][card].rank[i] == -1 ? "" : ranks[expansion][card].rank[i]));
			row.appendChild(r);
			if (!ranks[expansion].year[i].includes('Hot') && ranks[expansion].year[i] != '2018' && !(expansion == "Menagerie Ways" && ranks[expansion].year[i] == 2020)) {
				let d = document.createElement('td');
				let diff = ranks[expansion][card].diff[i]
				d.classList.add('diff-cell');
				d.appendChild(document.createTextNode(diff === null ? "" : ((diff > 0 ? '+' : '') + diff)));
				row.appendChild(d);
			}
		}
		etable.appendChild(row);
	}
	return etable;
}

function sortTable(ev) {
	let tar = ev.target;
	let sortYear = tar.textContent;
	let desc = false;
	if (sortYear.includes("▲")) {
		desc = true;
		sortYear = sortYear.slice(0, -1);
	} else if (sortYear.includes("▼")) {
		sortYear = sortYear.slice(0, -1);
	}
	if (sortYear == '+/-') {
		sortYear = tar.previousSibling.textContent.replace(/▲|▼/, '') + ' diff';
	}
	let expansionTable = tar.parentElement.parentElement.parentElement;
	let expansion = expansionTable.id.split('-').slice(0,-1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
	expansionTable.innerHTML = '';
	expansionTable.appendChild(renderTable(expansion, sortYear, desc));
}

function renderChart(expansion) {
	var chartData = [];
	var years = ranks[expansion]['year'].slice().reverse();
	var maxRank = 0;
	let expCards = Object.keys(ranks[expansion]).filter(x => x !== 'year');
	if (expansion == 'Cornucopia + Guilds') {
		for (card of expCards) {
			for (let i = years.length-1; i >= 0; i--) {
				if (ranks[expansion][card].rank[i] != -1) {
					chartData.push({'card': card, 'year': ranks[expansion]['year'][i], 'rank': ['2018', '2019'].includes(ranks[expansion]['year'][i]) ? ranks[expansion][card].rank[i] * 2 - 0.5 : ranks[expansion][card].rank[i]});
				}
				if (ranks[expansion][card].rank[i] > maxRank) {
					maxRank = ranks[expansion][card].rank[i];
				}
			}
		}
	} else {
		for (card of expCards) {
			for (let i = years.length-1; i >= 0; i--) {
				if (ranks[expansion][card].rank[i] != -1) {
					chartData.push({'card': card, 'year': ranks[expansion]['year'][i], 'rank': ranks[expansion][card].rank[i]});
				}
				if (ranks[expansion][card].rank[i] > maxRank) {
					maxRank = ranks[expansion][card].rank[i];
				}
			}
		}
	}
	
	var spec = {
		'height': 500,
		'width': 700,
		'data': {'values': chartData},
		'layer': [
			{
				'mark': {
					'type': 'line',
					'strokeWidth': 2,
					'stroke': '#000000'
				},
				'selection': {
					'hovered': {'type': 'single', 'fields': ['card'], 'on': 'mouseover', 'empty': 'all'}
				},
				'encoding': {
					'x': {
						'field': 'year',
						'type': 'ordinal',
						'scale': {'domain': years},
						'title': 'Ranking Time',
						'axis': {'grid': true, 'labelAngle': 0}
					},
					'y': {
						'field': 'rank',
						'type': 'quantitative',
						'scale': {
							'reverse': true,
							'domain': [0, maxRank + 1],
							'nice': false
						},
						'title': null,
						'axis': {'domain': false, 'labels': false, 'grid': false, 'ticks': false}
					},
					'strokeDash': {
						'field': 'card',
						'scale': {
							'domain': expCards,
							'range': Array.from({length: expCards.length}, () => [1,0])
						},
						'legend': null
					},
					'opacity': {'condition': {'selection': 'hovered', 'value': 1}, 'value': 0.3},
					'tooltip': {'field': 'card'}
				}
			},
			{
				'mark': {
					'type': 'point'
				},
				'encoding': {
					'x': {
						'field': 'year',
						'type': 'ordinal',
						'scale': {'domain': years}
					},
					'y': {'field': 'rank', 'type': 'quantitative'},
					'color': {
						'field': 'card',
						'scale': {
							'domain': expCards,
							'range': Array.from({length: expCards.length}, () => '#000000')
						},
						'legend': null
					},
					'opacity': {'condition': {'selection': 'hovered', 'value': 1}, 'value': 0.3},
					'tooltip': {'field': 'card'}
				}
			},
			{
				'transform': [
					{'filter': `datum.year == '${years[years.length-1]}'`}
				],
				'mark': {
					'type': 'text',
					'align': 'left',
					'dx': 6
				},
				'encoding': {
					'x': {
						'field': 'year',
						'type': 'ordinal',
						'scale': {'domain': years}
					},
					'y': {'field': 'rank', 'type': 'quantitative'},
				'text': {'field': 'card'}
				}
			},
			{
				'transform': [
					{'filter': `datum.year == '${years[0]}'`}
				],
				'mark': {
					'type': 'text',
					'align': 'right',
					'dx': -6
				},
				'encoding': {
					'x': {
						'field': 'year',
						'type': 'ordinal',
						'scale': {'domain': years}
					},
					'y': {'field': 'rank', 'type': 'quantitative'},
					'text': {'field': 'card'}
				}
			}
		],
		'config': {'style': {'cell': {'stroke': 'transparent'}}}
	}
	
	if (expansion == 'Cornucopia + Guilds') {
		spec.layer[3].transform.push({'filter': `indexof(${JSON.stringify(mixed.Cornucopia)}, datum.card) >= 0`});
		spec.layer[3].mark.dy = -6;
		spec.layer.push(JSON.parse(JSON.stringify(spec.layer[3])));
		spec.layer[4].transform[1] = ({'filter': `indexof(${JSON.stringify(mixed.Cornucopia)}, datum.card) == -1`});
		spec.layer[4].mark.dy = 6;
	}
	
	vegaEmbed(`#${expansion.toLowerCase().replace(/ /g, '-').replace('+', '')}-chart`, spec, {"actions": false}).then(function(res) {charts[expansion] = res.view});
}
