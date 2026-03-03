async function populateDictionarySelect(selectId) {

    const select = document.getElementById(selectId);

    const response = await fetch("dictionaries/index.json");
    const dictionaries = await response.json();

    select.innerHTML = `<option value="">Select dictionary</option>`;

    dictionaries.forEach(dict => {
        const opt = document.createElement("option");
        opt.value = dict.file;
        opt.textContent = dict.title;
        select.appendChild(opt);
    });
}


async function loadSelectedDictionary(selectId) {

    const select = document.getElementById(selectId);
    const filePath = select.value;

    if (!filePath) return [];

    const response = await fetch(`dictionaries/${filePath}`);
    const data = await response.json();

    // підтримка формату core + extra
    if (data.core && data.extra) {
        return [...data.core, ...data.extra];
    }

    return data;
                }
