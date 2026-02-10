'use strict';

/* 1. user adds categories (Done)
a. allow user to add categories (Done)
b. allow user to remove categories (Done)
*/
// 2. user inserts username (Done)
/* 3. User click "Start Game" (Done)
a. Store categories and username for later (Done)
b. 
*/
/* 4. Show game page with all the information (Done)
a. Get username (Done)
b. Categories and config data (Done)
 */
/* 5. User Clicks Start Round (Done)
a. before round starts answer and score or grayed out/disabled (Done)
b. User cannot change the categories (Done)
c. button text changes to "Next Round" (Done)
 */
/* 6. Round becomes playable and timer starts (Done)
 */
/* 7. User inserts answer and score for each category (Done)
a. If timer stops user no longer able to add answer (Done)
 */
/* 8. Show summary page (Done)
a. show congrats "username" (Done)
b. Total score
c. Summary of each round ()
	aa. {
		"Round 1": {
			"Girls": {
				answer: "Susan",
				score: 5,
			}
		}
	} (Done)
*/

const categoriesStyleMap = new Map([
	[0, { backgroundColor: '#B3DEE2', textColor: '#000' }],
	[1, { backgroundColor: '#FFE45E', textColor: '#000' }],
	[2, { backgroundColor: '#FFBF81', textColor: '#000' }],
	[3, { backgroundColor: '#7371FC', textColor: '#fff' }],
	[4, { backgroundColor: '#F85C6A', textColor: '#fff' }],
	[5, { backgroundColor: '#ADD1A8', textColor: '#000' }],
	[6, { backgroundColor: '#00ff00', textColor: '#000' }],
	[7, { backgroundColor: '#EBDDBF', textColor: '#000' }],
]);

////////////////////////////////////////////////
// Variables
////////////////////////////////////////////////
// landingPage
const landingPage = document.querySelector('.landing-page');
const landingPageCategories = landingPage.querySelector('.categories');
// ---------- //

// gamePage
const gamePage = document.querySelector('.game-page');
const gamePageCategories = gamePage.querySelector('.categories');
const gamePageAnswerAndScoreContainer = gamePage.querySelector(
	'.answer-score-container',
);
let gamePageAnswerContainers, gamePageScoreContainers;
// ---------- //

// summaryPage
const summaryPage = document.querySelector('.summary-page');
const summaryPageUsernameEl = summaryPage.querySelector('.username');
const summaryPageRoundSummary = summaryPage.querySelector('.rounds-summary');
// ---------- //

// buttons
const btnAddCat = document.querySelector('.btn-add-category');
const btnStartGame = document.querySelector('.btn-start-game');
const btnRemoveCat = document.querySelectorAll('.btn-remove-category');
const btnRound = document.querySelector('.btn-round');
const btnEndGame = document.querySelector('.btn-end-game');
const btnPlayAgain = document.querySelector('.btn-play-again');
// ---------- //

const allLandingPageCategories = new Map();
let username;
let roundStarted = false;
let round = 1;

// timer
let countdownTimer;
let timeLeft = 120;
const timerEl = gamePage.querySelector('.timer');
// ---------- //

const roundsData = {};
////////////////////////////////////////////////

////////////////////////////////////////////////
// Functions
////////////////////////////////////////////////
const confirmMessage = function (message) {
	return window.confirm(message);
};

const timer = function (func, action) {
	if (action === 'start') {
		clearInterval(countdownTimer);
		// 2:00 Timer
		countdownTimer = setInterval(() => {
			timeLeft--;
			const minutes = Math.floor(timeLeft / 60);
			const seconds = timeLeft % 60;
			timerEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
			if (timeLeft <= 0) {
				func();
				clearInterval(countdownTimer);
			}
		}, 1000);
	} else if (action === 'reset') {
		clearInterval(countdownTimer);
		timeLeft = 120;
		timerEl.textContent = '2:00';
	}
};

const toggleGrayscale = function (el) {
	el.classList.toggle('grayscale');
};

const toggleDisable = function (el) {
	if (el.hasAttribute('disabled')) {
		el.removeAttribute('disabled');
		return;
	} else if (!el.hasAttribute('disabled')) {
		el.setAttribute('disabled', 'disabled');
		return;
	}
};

const addRoundData = function (round, i) {
	const bgColor = gamePageAnswerContainers[i].style.backgroundColor;
	const txtColor = gamePageAnswerContainers[i].querySelector('p').style.color;
	const cat = gamePageAnswerContainers[i].querySelector('p').textContent;
	const answer = gamePageAnswerContainers[i].querySelector('input').value;
	const score = gamePageScoreContainers[i].querySelector('select').value;
	roundsData[`Round ${round}`].push({
		cat: cat,
		answer: answer,
		score: score,
		bgColor: bgColor,
		txtColor: txtColor,
	});
};

const generateNewCategoryHTML = function (bgColor, txtColor) {
	return `
        <div class="category" style='background-color: ${bgColor}'>
            <input
                type="text"
                name="new-category"
                id=""
                placeholder="Insert Category"
                style='color: ${txtColor}'
            />
            <button class="btn btn-remove-category">-</button>
        </div>
    `;
};

const insertCategoryButton = function (category, bgColor, txtColor) {
	if (!category) return;

	const btn = document.createElement('div');
	btn.classList.add('category');
	btn.style.backgroundColor = bgColor;
	btn.style.color = txtColor;
	btn.textContent = category;

	gamePageCategories.insertAdjacentElement('beforeend', btn);
};

const insertAnswerAndScoreHTML = function (category, bgColor, txtColor) {
	if (!category) return;

	const html = `
    <section class='${category.toLowerCase().replaceAll(' ', '-')}-container container'>
      <section class="answer-container grayscale" style="background-color: ${bgColor}">
        <p class="answer-label" style='color: ${txtColor}'>${category} Answer</p>

        <input type="text" name="answer" class="answer answer-${category.toLowerCase()}" disabled autocomplete="off"/>
      </section>

      <section class="score-container grayscale" style="background-color: ${bgColor}">
        <p class="score-label" style="color: ${txtColor}; font-size: 14px">Add Score</p>

        <select name="score" class='score score-${category.toLowerCase()}' style="outline: none; padding: 16px; width: 100%" disabled>
          <option value="0">0</option>
          <option value="5">5</option>
          <option value="10">10</option>
        </select>
      </section>
    </section>`;

	gamePageAnswerAndScoreContainer.insertAdjacentHTML('beforeend', html);
};

const addCategoryConfigData = function (category, bgColor, txtColor) {
	allLandingPageCategories.has(category)
		? null
		: allLandingPageCategories.set(category, [bgColor, txtColor]);
};

const changeAnswerAndScoreContainer = function (category) {
	if (!roundStarted) return;

	// change answer and score container attributes
	for (const element of gamePageAnswerAndScoreContainer.children) {
		element.style.display = 'none';
	}

	const container = gamePage.querySelector(
		`.${category.toLowerCase().trim().replaceAll(' ', '-')}-container`,
	);
	container.style.display = 'flex';
};

const generateRoundDataHTML = function (round, data) {
	let html = `<p>${round}</p>`;

	data.forEach((e) => {
		html += `
		<section style="background-color: ${e.bgColor}">
			<div class='label-score' style='color: ${e.txtColor}'>
				<p style='margin-top: 0'>${e.cat}</p>
				<p style='margin-top: 0'>+${e.score}</p>
			</div>
			
			<input type="text" disabled value='${e.answer}'/>
		</section>`;
	});

	return html;
};
////////////////////////////////////////////////

////////////////////////////////////////////////
// Event Handlers
////////////////////////////////////////////////
// prevent accidental page reload
window.addEventListener('beforeunload', function (e) {
	e.preventDefault();
});

// add category
btnAddCat.addEventListener('click', function () {
	const index = Math.trunc(Math.random() * categoriesStyleMap.size);

	const backgroundColor = categoriesStyleMap.get(index).backgroundColor;
	const textColor = categoriesStyleMap.get(index).textColor;

	landingPageCategories.insertAdjacentHTML(
		'beforeend',
		generateNewCategoryHTML(backgroundColor, textColor),
	);
});

// remove category
landingPageCategories.addEventListener('click', function (event) {
	const cat = event.target.closest('.category');
	const btn = event.target.closest('.btn-remove-category');

	if (btn && cat) {
		cat.remove();
	}
});

btnStartGame.addEventListener('click', function () {
	const confirmStartGame = confirmMessage(
		'Are you sure you are ready to Start Game?',
	);

	username = landingPage.querySelector('.username').value;

	// guard clause(s)
	if (!confirmStartGame) return;
	if (!username) {
		window.alert('Please add your username');
		return;
	}

	landingPage.querySelectorAll('.category').forEach((e) => {
		const input = e.querySelector('input');

		const catName = input.value;
		const catBackgroundColor = e.style.backgroundColor;
		const catTextColor = input.style.color;

		addCategoryConfigData(catName, catBackgroundColor, catTextColor);
	});

	for (const [category, [bgColor, txtColor]] of [...allLandingPageCategories]) {
		insertCategoryButton(category, bgColor, txtColor);

		insertAnswerAndScoreHTML(category, bgColor, txtColor);
	}

	landingPage.style.display = 'none';
	gamePage.style.display = 'flex';
});

gamePageCategories.addEventListener('click', function (event) {
	// click cat button and get style code
	const btnCategory = event.target.closest('.game-page .categories .category');

	const category = btnCategory.textContent;

	changeAnswerAndScoreContainer(category);
});

// start round / next round
btnRound.addEventListener('click', function (e) {
	// this needs to be assigned here, because it doesn't exist any earlier
	// I can't add it to the top of the script
	gamePageAnswerContainers = gamePage.querySelectorAll('.answer-container');
	gamePageScoreContainers = gamePage.querySelectorAll('.score-container');

	if (e.target.classList.contains('btn-start-round')) {
		if (roundStarted) return;

		roundStarted = true;

		btnEndGame.style.display = 'none';

		e.target.textContent = 'Next Round';
		e.target.classList.add('btn-next-round');
		e.target.classList.remove('btn-start-round');

		// active category btns
		toggleGrayscale(gamePageCategories);

		// activate answer containers
		gamePageAnswerContainers.forEach((el) => {
			el.classList.remove('grayscale');
			const input = el.querySelector('input');
			input.removeAttribute('disabled');
		});

		// activate score containers
		gamePageScoreContainers.forEach((el) => {
			el.classList.remove('grayscale');
			const select = el.querySelector('select');
			select.removeAttribute('disabled');
		});

		// start timer
		timer(function () {
			// if timer hits 0 disable answerContainers
			gamePageAnswerContainers.forEach((el) => {
				toggleGrayscale(el);
				const input = el.querySelector('input');
				toggleDisable(input);
			});
		}, 'start');
	} else if (e.target.classList.contains('btn-next-round')) {
		////////////////////////////////////////////////
		// Continue From Here
		// Figure out how to reset timer
		////////////////////////////////////////////////
		const moveToNextRound = confirmMessage('Move on to the Next Round?');

		if (!moveToNextRound) return;

		roundsData[`Round ${round}`] = [];

		for (let i = 0; i < gamePageAnswerContainers.length; i++)
			addRoundData(round, i);

		e.target.textContent = 'Start Round';
		e.target.classList.add('btn-start-round');
		e.target.classList.remove('btn-next-round');

		// active category btns
		toggleGrayscale(gamePageCategories);

		// reset answer containers
		gamePageAnswerContainers.forEach((el) => {
			el.classList.add('grayscale');
			const input = el.querySelector('input');
			input.value = '';
			input.setAttribute('disabled', 'disabled');
		});

		// reset score containers
		gamePageScoreContainers.forEach((el) => {
			el.classList.add('grayscale');
			const select = el.querySelector('select');
			select.value = 0;
			select.setAttribute('disabled', 'disabled');
		});

		gamePageAnswerAndScoreContainer
			.querySelectorAll('.container')
			.forEach((e) => (e.style.display = 'none'));
		gamePageAnswerAndScoreContainer.querySelector(
			'.container:first-child',
		).style.display = 'flex';

		// set new round started to false
		roundStarted = false;

		btnEndGame.style.display = 'block';

		// reset timer
		timer(function () {}, 'reset');

		round++;
	}
});

// end game
btnEndGame.addEventListener('click', function () {
	if (!confirmMessage('Are you sure you want to End Game?')) return;

	gamePage.style.display = 'none';
	summaryPage.style.display = 'flex';
	summaryPageUsernameEl.textContent = username;

	let totalScore = 0;

	for (const [key, value] of Object.entries(roundsData)) {
		value.forEach((e) => (totalScore += Number(e.score)));

		summaryPageRoundSummary.insertAdjacentHTML(
			'beforeend',
			generateRoundDataHTML(key, value),
		);
	}

	summaryPage.querySelector('.score').textContent = totalScore;
});

// play again
btnPlayAgain.addEventListener('click', function () {});
////////////////////////////////////////////////
