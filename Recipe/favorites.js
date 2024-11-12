document.addEventListener('DOMContentLoaded', () => {
    const favoritesContainer = document.getElementById('favorites-container');
    const mealDetailsContent = document.querySelector('.meal-details-content');
    const recipeCloseBtn = document.getElementById('recipe-close-btn');

    const apiKey = 'b645f6825d7d412680d2514014ad4373';
    const baseUrl = 'https://api.spoonacular.com/recipes';
    recipeCloseBtn.addEventListener('click', () => {
        console.log("zhabyldy");    
        mealDetailsContent.parentElement.classList.remove('showRecipe');
    });

    if (!favoritesContainer) {
        console.error("Favorites container not found. Check the ID in your HTML.");
        return;
    }
    
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    console.log("Favorites retrieved from localStorage:", favorites);

    if (favorites.length > 0) {
        let html = '';
        favorites.forEach(recipe => {
            html += `
                <div class="meal-item" data-recipe-id="${recipe.id}">
                        <div class="meal-img">
                            <img src="${recipe.image}" alt="food">
                        </div>
                    <div class="meal-name">
                                <h3>${recipe.name}</h3>
                            <a href="#" class="recipe-btn">Get Recipe</a>
                        <button class="remove-from-favorites">Remove from Favorites</button>
                    </div>
                </div>
            `;
        });

        favoritesContainer.innerHTML = html;
    } else {
        favoritesContainer.innerHTML = `<p class="noelement">No favorites added yet!</p>`   ;
    }

    // Combined event listener for both removing and getting recipe
    favoritesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-from-favorites')) {
            const recipeId = e.target.closest('.meal-item').getAttribute('data-recipe-id');
            let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            
            favorites = favorites.filter(recipe => recipe.id !== recipeId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            e.target.closest('.meal-item').remove();
            // alert('Recipe removed from favorites!');
        }

        if (e.target.classList.contains('recipe-btn')) {
            e.preventDefault();
            const mealItem = e.target.closest('.meal-item');  // Use closest to find meal item
            fetch(`${baseUrl}/${mealItem.dataset.recipeId}/information?apiKey=${apiKey}`)
            .then(response => response.json())
            .then(data => mealRecipeModal(data));
        }
    });

    // Create a modal for the recipe
    function mealRecipeModal(meal){
        let html = `
            <h2 class="recipe-title">${meal.title}</h2>
            <div class="category-parent"><p class="recipe-category">${meal.dishTypes ? meal.dishTypes.join(', ') : 'N/A'}</p></div>
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
});
