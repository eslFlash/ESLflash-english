async function populateDictionarySelect() {

    const select = document.getElementById("dictionarySelect");

    const response = await fetch("dictionaries/index.json");
    const dictionaries = await response.json();

    select.innerHTML = "";

    dictionaries.forEach(dict => {

        const option = document.createElement("option");

        option.value = dict.file;
        option.textContent = dict.title;

        select.appendChild(option);

    });

      }
