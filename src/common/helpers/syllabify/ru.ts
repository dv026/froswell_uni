const vowel = 'аеёиоуыэюя'; // Гласные буквы
const voiced = 'бвгджзлмнрхцчшщ'; // Звонкие и шипящие согласные
const deaf = 'кпстф'; // Глухие согласные
const brief = 'й'; // Й
const other = 'ьъ'; // Другие
const cons = 'бвгджзйклмнпрстфхцчшщ'; // Все согласные

function validateString(s: string) {
    // TODO: not implemented
    return s;
}

// Есть ли в строке гласные?
function isNotLastSep(remainStr) {
    let is = false;
    for (let i = 0; i < remainStr.length; i++) {
        if (vowel.indexOf(remainStr.substr(i, 1)) !== -1) {
            is = true;
            break;
        }
    }

    return is;
}

/**
 * Разбивает слова в строке на слоги.
 * Возвращает новую строку, в которой каждый слог разделен unicode символом &shy; ("soft" hyphen)
 * @param s строка
 */
export const uSyllabify = (s: string): string => syllabify(s, '\u00AD');

/**
 * Разбивает слова в строке на слоги.
 * Возвращает новую строку, в которой каждый слог разделен @param separator
 * @param s строка
 * @param separator разделитель слогов
 */
export const syllabify = (s: string, separator: string = '-'): string => {
    // Добавляем слог в массив и начинаем новый слог
    function addSep() {
        sepArr.push(tmpS);
        tmpS = '';
    }

    s = validateString(s);
    let tmpL = ''; // Текущий символ
    let tmpS = ''; // Текущий слог
    let sepArr = []; // Массив слогов
    for (let i = 0; i < s.length; i++) {
        tmpL = s.substr(i, 1);
        tmpS += tmpL;
        // Проверка на признаки конца слогов
        // если буква равна 'й' и она не первая и не последняя и это не последний слог
        if (
            i !== 0 &&
            i !== s.length - 1 &&
            brief.indexOf(tmpL) !== -1 &&
            isNotLastSep(s.substr(i + 1, s.length - i + 1))
        ) {
            addSep();
            continue;
        }

        // если текущая гласная и следующая тоже гласная
        if (i < s.length - 1 && vowel.indexOf(tmpL) !== -1 && vowel.indexOf(s.substr(i + 1, 1)) !== -1) {
            addSep();
            continue;
        }

        // если текущая гласная, следующая согласная, а после неё гласная
        if (
            i < s.length - 2 &&
            vowel.indexOf(tmpL) !== -1 &&
            cons.indexOf(s.substr(i + 1, 1)) !== -1 &&
            vowel.indexOf(s.substr(i + 2, 1)) !== -1
        ) {
            addSep();
            continue;
        }

        // если текущая гласная, следующая глухая согласная, а после согласная и это не последний слог
        if (
            i < s.length - 2 &&
            vowel.indexOf(tmpL) !== -1 &&
            deaf.indexOf(s.substr(i + 1, 1)) !== -1 &&
            cons.indexOf(s.substr(i + 2, 1)) !== -1 &&
            isNotLastSep(s.substr(i + 1, s.length - i + 1))
        ) {
            addSep();
            continue;
        }

        // если текущая звонкая или шипящая согласная, перед ней гласная, следующая не гласная и не другая,
        // и это не последний слог
        if (
            i > 0 &&
            i < s.length - 1 &&
            voiced.indexOf(tmpL) !== -1 &&
            vowel.indexOf(s.substr(i - 1, 1)) !== -1 &&
            vowel.indexOf(s.substr(i + 1, 1)) === -1 &&
            other.indexOf(s.substr(i + 1, 1)) === -1 &&
            isNotLastSep(s.substr(i + 1, s.length - i + 1))
        ) {
            addSep();
            continue;
        }

        // если текущая другая, а следующая не гласная если это первый слог
        if (
            i < s.length - 1 &&
            other.indexOf(tmpL) !== -1 &&
            (vowel.indexOf(s.substr(i + 1, 1)) === -1 || isNotLastSep(s.substr(0, i)))
        ) {
            addSep();
            continue;
        }
    }

    sepArr.push(tmpS);

    return sepArr.join(separator);
};
