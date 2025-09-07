document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestionsBox');

    if (!searchInput) return; // safety check

    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();
        if (!query) {
            suggestionsBox.innerHTML = '';
            return;
        }

        try {
            const res = await fetch(`/listings/suggestions?q=${query}`);
            const suggestions = await res.json();

            if (suggestions.length === 0) {
                suggestionsBox.innerHTML = '';
                return;
            }

            suggestionsBox.innerHTML = suggestions
                .map(s => `<button type="button" class="list-group-item list-group-item-action">${s}</button>`)
                .join('');

            document.querySelectorAll('#suggestionsBox button').forEach(btn => {
                btn.addEventListener('click', () => {
                    searchInput.value = btn.textContent;
                    suggestionsBox.innerHTML = '';
                    searchInput.form.submit();
                });
            });

        } catch (err) {
            console.error(err);
        }
    });

    document.addEventListener('click', (e) => {
        if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
            suggestionsBox.innerHTML = '';
        }
    });
});
