const groupSelect = document.getElementById("groupSelect");
const scheduleContainer = document.getElementById("schedule");

let scheduleData = null;

/* =========================
ЗАГРУЗКА РАСПИСАНИЯ
========================= */

async function loadSchedule() {
try {
const response = await fetch(
"https://ssg18.github.io/raspisanie-test/schedule.json"
);

```
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    scheduleData = await response.json();

    console.log("Расписание загружено:", scheduleData);

    fillGroups();

} catch (error) {
    console.error("Ошибка загрузки расписания:", error);

    scheduleContainer.innerHTML = `
        <p style="color: red;">
            Не удалось загрузить расписание.
        </p>
    `;
}
```

}

/* =========================
ЗАПОЛНЕНИЕ СПИСКА ГРУПП
========================= */

function fillGroups() {
groupSelect.replaceChildren();

```
const defaultOption = document.createElement("option");

defaultOption.value = "";
defaultOption.textContent = "Выберите группу";

groupSelect.appendChild(defaultOption);

if (!scheduleData || !Array.isArray(scheduleData.groups)) {
    return;
}

scheduleData.groups.forEach(group => {
    if (!group || !group.grp) {
        return;
    }

    const option = document.createElement("option");

    option.value = String(group.grp);
    option.textContent = String(group.grp);

    groupSelect.appendChild(option);
});
```

}

/* =========================
РАСЧЁТ ПОНЕДЕЛЬНИКА
========================= */

function getMonday(date) {
const result = new Date(date);

```
result.setHours(0, 0, 0, 0);

const day = result.getDay();

// JS:
// 0 = воскресенье
// 1 = понедельник
// 2 = вторник
// ...
// 6 = суббота

const difference = day === 0 ? -6 : 1 - day;

result.setDate(result.getDate() + difference);

return result;
```

}

/* =========================
ПОЛУЧЕНИЕ НЕДЕЛИ
========================= */

function getCurrentWeekInfo() {
const today = new Date();

```
today.setHours(0, 0, 0, 0);

/*
    Если сегодня суббота или воскресенье,
    показываем следующую неделю.
*/

const jsDay = today.getDay();

let targetDate = new Date(today);

if (jsDay === 0 || jsDay === 6) {
    targetDate.setDate(targetDate.getDate() + 7);
}

const monday = getMonday(targetDate);

const sunday = new Date(monday);

sunday.setDate(sunday.getDate() + 6);

/*
    Учебный год начинается 1 сентября.

    Неделя №1 — неделя, в которую попадает 1 сентября.
*/

const academicYearStart = new Date(
    today.getFullYear(),
    8,
    1
);

/*
    Если дата находится в январе-августе,
    учебный год начался 1 сентября прошлого года.
*/

if (today.getMonth() < 8) {
    academicYearStart.setFullYear(
        today.getFullYear() - 1
    );
}

const firstMonday = getMonday(academicYearStart);

const difference =
    monday.getTime() - firstMonday.getTime();

const weekNumber =
    Math.floor(
        difference / (7 * 24 * 60 * 60 * 1000)
    ) + 1;

return {
    weekNumber,
    monday,
    sunday
};
```

}

/* =========================
ФОРМАТ ДАТЫ
========================= */

function formatDate(date) {
const day = String(date.getDate()).padStart(2, "0");
const month = String(date.getMonth() + 1).padStart(2, "0");
const year = date.getFullYear();

```
return `${day}.${month}.${year}`;
```

}

/* =========================
ПРОВЕРКА НЕДЕЛИ ЗАНЯТИЯ
========================= */

function isLessonInWeek(lesson, weekNumber) {
if (
lesson.ws === undefined ||
lesson.ws === null ||
lesson.ws === ""
) {
return true;
}

```
const weeksString = String(lesson.ws)
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/\s/g, "");

/*
    Например:

    "2,4,6,8"
    "1-17"
    "2,4,6-10"
*/

const parts = weeksString.split(",");

for (const part of parts) {

    if (part.includes("-")) {

        const range = part.split("-");

        const start = Number(range[0]);
        const end = Number(range[1]);

        if (
            !Number.isNaN(start) &&
            !Number.isNaN(end) &&
            weekNumber >= start &&
            weekNumber <= end
        ) {
            return true;
        }

    } else {

        const week = Number(part);

        if (
            !Number.isNaN(week) &&
            week === weekNumber
        ) {
            return true;
        }
    }
}

return false;
```

}

/* =========================
ОТОБРАЖЕНИЕ РАСПИСАНИЯ
========================= */

function showSchedule(group) {

```
if (
    !scheduleData ||
    !Array.isArray(scheduleData.schedule)
) {
    return;
}

scheduleContainer.innerHTML = "";

const weekInfo = getCurrentWeekInfo();

/*
    API КГМУ:

    1 = воскресенье
    2 = понедельник
    3 = вторник
    4 = среда
    5 = четверг
    6 = пятница
    7 = суббота
*/

const days = [
    {
        number: 2,
        name: "Понедельник"
    },
    {
        number: 3,
        name: "Вторник"
    },
    {
        number: 4,
        name: "Среда"
    },
    {
        number: 5,
        name: "Четверг"
    },
    {
        number: 6,
        name: "Пятница"
    },
    {
        number: 7,
        name: "Суббота"
    }
];


/* =========================
   ЗАГОЛОВОК НЕДЕЛИ
   ========================= */

const weekHeader = document.createElement("div");

weekHeader.className = "week-header";

weekHeader.innerHTML = `
    <h2>Неделя №${weekInfo.weekNumber}</h2>
    <p>
        ${formatDate(weekInfo.monday)}
        —
        ${formatDate(weekInfo.sunday)}
    </p>
`;

scheduleContainer.appendChild(weekHeader);


/* =========================
   ДНИ НЕДЕЛИ
   ========================= */

days.forEach(day => {

    const lessons = scheduleData.schedule.filter(lesson => {

        /*
            Проверяем день.

            Например:
            wd = 2 → понедельник
            wd = 3 → вторник
        */

        const correctDay =
            Number(lesson.wd) === day.number;


        /*
            Проверяем группу.
        */

        const correctGroup =
            Array.isArray(lesson.sg) &&
            lesson.sg.some(
                item =>
                    String(item) === String(group)
            );


        /*
            Проверяем номер недели.
        */

        const correctWeek =
            isLessonInWeek(
                lesson,
                weekInfo.weekNumber
            );


        return (
            correctDay &&
            correctGroup &&
            correctWeek
        );
    });


    /* =========================
       БЛОК ДНЯ
       ========================= */

    const dayBlock =
        document.createElement("div");

    dayBlock.className = "day";


    const dayTitle =
        document.createElement("h3");

    dayTitle.textContent =
        day.name;

    dayBlock.appendChild(dayTitle);


    /* =========================
       ЕСЛИ НЕТ ЗАНЯТИЙ
       ========================= */

    if (lessons.length === 0) {

        const empty =
            document.createElement("p");

        empty.textContent =
            "Занятий нет";

        empty.className =
            "no-lessons";

        dayBlock.appendChild(empty);

    } else {

        /*
            Сортировка по времени начала.
        */

        lessons.sort((a, b) => {

            return String(a.ts || "")
                .localeCompare(
                    String(b.ts || "")
                );
        });


        lessons.forEach(lesson => {

            const lessonElement =
                document.createElement("div");

            lessonElement.className =
                "lesson";


            /*
                Тип занятия
            */

            let lessonType = "";

            if (Number(lesson.lt) === 102) {
                lessonType = "Лекция";
            } else if (Number(lesson.lt) === 103) {
                lessonType = "Практика";
            } else if (lesson.lt) {
                lessonType = String(lesson.lt);
            }


            /*
                Создаём карточку занятия.
            */

            lessonElement.innerHTML = `
                <div class="lesson-time">
                    ${lesson.ts || ""}
                    –
                    ${lesson.te || ""}
                </div>

                <div class="lesson-subject">
                    ${lesson.ln || "Без названия"}
                </div>

                ${
                    lessonType
                        ? `<div class="lesson-type">
                            ${lessonType}
                           </div>`
                        : ""
                }

                ${
                    lesson.tn
                        ? `<div class="lesson-teacher">
                            ${lesson.tn}
                           </div>`
                        : ""
                }

                ${
                    lesson.loc
                        ? `<div class="lesson-location">
                            ${lesson.loc}
                           </div>`
                        : ""
                }

                ${
                    lesson.ws
                        ? `<div class="lesson-weeks">
                            Недели: ${lesson.ws}
                           </div>`
                        : ""
                }
            `;

            dayBlock.appendChild(
                lessonElement
            );
        });
    }


    scheduleContainer.appendChild(
        dayBlock
    );
});
```

}

/* =========================
ВЫБОР ГРУППЫ
========================= */

groupSelect.addEventListener(
"change",
function () {

```
    const selectedGroup =
        String(this.value);

    if (!selectedGroup) {

        scheduleContainer.innerHTML = "";

        return;
    }

    showSchedule(selectedGroup);
}
```

);

/* =========================
ЗАПУСК
========================= */

loadSchedule();
