        const searchBtn = document.getElementById('search-btn');
        const mealList = document.getElementById('meal');
        const mealDetailsContent = document.querySelector('.meal-details-content');
        const recipeCloseBtn = document.getElementById('recipe-close-btn');
        const titleResult = document.querySelector('.meal_result');
        const suggestionsContainer = document.getElementById('suggestions');
        const searchInput = document.getElementById('search-input');

        // API Key and Base URL for Spoonacular
        const apiKey = 'b645f6825d7d412680d2514014ad4373';
        const baseUrl = 'https://api.spoonacular.com/recipes';

        searchInput.addEventListener('input', function () {
            const query = searchInput.value.trim();
        
            if (query.length >= 2) { // Minimum characters to start autocomplete
                fetch(`${baseUrl}/autocomplete?query=${query}&number=5&apiKey=${apiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        showSuggestions(data);
                    });
            } else {
                suggestionsContainer.innerHTML = ""; // Clear suggestions if input is less than 2 chars
            }
        });
        
        // Display suggestions
        function showSuggestions(data) {
            suggestionsContainer.innerHTML = ""; // Clear previous suggestions
        
            if (data && data.length > 0) {
                data.forEach(item => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = item.title;
        
                    // Set input field value on click
                    suggestionItem.addEventListener('click', () => {
                        searchInput.value = item.title;
                        suggestionsContainer.innerHTML = ""; // Clear suggestions after selection
                        getMealList(); // Trigger search for the selected suggestion
                    });
        
                    suggestionsContainer.appendChild(suggestionItem);
                });
            }
        }

        // Event listeners
        searchBtn.addEventListener('click', getMealList);
        mealList.addEventListener('click', getMealRecipe);
        recipeCloseBtn.addEventListener('click', () => {
            console.log("zhabyldy");
            mealDetailsContent.parentElement.classList.remove('showRecipe');
        });
        
        
        // Get meal list that matches with the ingredients
        function getMealList(){
            suggestionsContainer.innerHTML = "";
            let searchInputTxt = document.getElementById('search-input').value.trim();
            fetch(`${baseUrl}/complexSearch?query=${searchInputTxt}&number=6&apiKey=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                let html = "";
                if(data.results && data.results.length > 0){
                    data.results.forEach(meal => {
                        html += `
                            <div class="meal-item" data-id="${meal.id}">
                                <div class="meal-img">
                                    <img src="${meal.image}" alt="food">
                                </div>
                                <div class="meal-name">
                                    <h3>${meal.title}</h3>
                                    <a href="#" class="recipe-btn">Get Recipe</a>
                                    <button class="add-to-favorites">Add to Favorites</button>
                                </div>
                            </div>
                        `;
                    });
                    mealList.classList.remove('notFound');
                } else{
                    html = `<p class="noelement">Sorry, we didn't find any meal!</p>`;
                    mealList.classList.add('notFound');
                }

                mealList.innerHTML = html;
                document.querySelectorAll('.add-to-favorites').forEach(button => {
                    button.addEventListener('click', function () {
                        const recipeCard = button.closest('.meal-item');
                        const recipeId = recipeCard.getAttribute('data-id'); // Unique ID for each recipe
                        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                
                        // Convert recipeId to a number (if needed) for correct comparison
                        const recipeExists = favorites.some(recipe => recipe.id == recipeId);
                        if (!recipeExists) {
                            const recipeData = {
                                id: recipeId,
                                name: recipeCard.querySelector('.meal-name h3').textContent,
                                image: recipeCard.querySelector('.meal-img img').src,
                            };
                            favorites.push(recipeData);
                            console.log(favorites);
                            localStorage.setItem('favorites', JSON.stringify(favorites));
                            // alert('Recipe added to favorites!');
                        } else {
                            alert('Recipe already in favorites!');
                        }
                    });
                });
            });
        }
        
        // Get recipe of the meal
        function getMealRecipe(e){
            e.preventDefault();
            if(e.target.classList.contains('recipe-btn')){
                let mealItem = e.target.parentElement.parentElement;
                fetch(`${baseUrl}/${mealItem.dataset.id}/information?apiKey=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    mealRecipeModal(data);
                    mealDetailsContent.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                });
            }
        }

        function mealRecipeModal(meal) {
            let html = `
                <h2 class="recipe-title">${meal.title}</h2>
                <p class="recipe-category">${meal.dishTypes ? meal.dishTypes.join(', ') : 'N/A'}</p>
                <div class="recipe-instruct">
                    <h3>Instructions:</h3>
                    <p>${meal.instructions || "No instructions available."}</p>
                </div>
                <div class="recipe-meal-img">
                    <img src="${meal.image}" alt="">
                </div>
                <div class="recipe-link">
                    ${meal.sourceUrl ? `<a href="${meal.sourceUrl}" target="_blank">View Full Recipe</a>` : ''}
                </div>
            `;
            mealDetailsContent.innerHTML = html;
            mealDetailsContent.parentElement.classList.add('showRecipe');
        }
        