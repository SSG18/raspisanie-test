const groupSelect = document.getElementById("groupSelect");
const scheduleContainer = document.getElementById("schedule");

let scheduleData = null;


/* ==============================
   ЗАГРУЗКА JSON
   ============================== */

async function loadSchedule() {
    try {
        const response = await fetch(
            "https://ssg18.github.io/raspisanie-test/schedule.json"
        );

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        scheduleData = await response.json();

        console.log("JSON успешно загружен");
        console.log(scheduleData);

        fillGroups();

    } catch (error) {
        console.error("Ошибка загрузки:", error);

        scheduleContainer.innerHTML =
            "<p>Ошибка загрузки расписания.</p>";
    }
}


/* ==============================
   ЗАПОЛНЕНИЕ ГРУПП
   ============================== */

function fillGroups() {

    groupSelect.innerHTML = "";

    var defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Выберите группу";

    groupSelect.appendChild(defaultOption);


    if (
        !scheduleData ||
        !scheduleData.groups ||
        !Array.isArray(scheduleData.groups)
    ) {
        console.error("Массив groups не найден");
        return;
    }


    scheduleData.groups.forEach(function(group) {

        if (!group || !group.grp) {
            return;
        }

        var option = document.createElement("option");

        option.value = String(group.grp);
        option.textContent = String(group.grp);

        groupSelect.appendChild(option);
    });
}


/* ==============================
   ПОНЕДЕЛЬНИК НЕДЕЛИ
   ============================== */

function getMonday(date) {

    var result = new Date(date);

    result.setHours(0, 0, 0, 0);

    var day = result.getDay();

    /*
        JavaScript:
        0 = воскресенье
        1 = понедельник
        2 = вторник
        3 = среда
        4 = четверг
        5 = пятница
        6 = суббота
    */

    if (day === 0) {
        result.setDate(result.getDate() - 6);
    } else {
        result.setDate(result.getDate() - day + 1);
    }

    return result;
}


/* ==============================
   ИНФОРМАЦИЯ О НЕДЕЛЕ
   ============================== */

function getWeekInfo() {

    var today = new Date();

    today.setHours(0, 0, 0, 0);


    /*
        Если сегодня суббота или воскресенье,
        показываем следующую неделю.
    */

    var targetDate = new Date(today);

    var todayDay = today.getDay();

    if (todayDay === 6 || todayDay === 0) {
        targetDate.setDate(
            targetDate.getDate() + 7
        );
    }


    var monday = getMonday(targetDate);


    var sunday = new Date(monday);

    sunday.setDate(
        sunday.getDate() + 6
    );


    /*
        Определяем 1 сентября
        текущего учебного года.
    */

    var academicYearStart;

    if (today.getMonth() >= 8) {

        academicYearStart = new Date(
            today.getFullYear(),
            8,
            1
        );

    } else {

        academicYearStart = new Date(
            today.getFullYear() - 1,
            8,
            1
        );
    }


    /*
        Понедельник первой недели.
    */

    var firstMonday =
        getMonday(academicYearStart);


    /*
        Количество недель между
        первой и текущей неделей.
    */

    var millisecondsInWeek =
        7 * 24 * 60 * 60 * 1000;

    var difference =
        monday.getTime() -
        firstMonday.getTime();

    var weekNumber =
        Math.floor(
            difference / millisecondsInWeek
        ) + 1;


    return {
        weekNumber: weekNumber,
        monday: monday,
        sunday: sunday
    };
}


/* ==============================
   ФОРМАТ ДАТЫ
   ============================== */

function formatDate(date) {

    var day =
        String(date.getDate()).padStart(2, "0");

    var month =
        String(date.getMonth() + 1).padStart(2, "0");

    var year =
        date.getFullYear();

    return day + "." + month + "." + year;
}


/* ==============================
   ПРОВЕРКА НЕДЕЛИ ЗАНЯТИЯ
   ============================== */

function isLessonInWeek(lesson, weekNumber) {

    /*
        Если ws отсутствует,
        считаем занятие постоянным.
    */

    if (
        lesson.ws === undefined ||
        lesson.ws === null ||
        lesson.ws === ""
    ) {
        return true;
    }


    var weeks = String(lesson.ws)
        .replace(/–/g, "-")
        .replace(/—/g, "-")
        .replace(/\s/g, "");


    var parts = weeks.split(",");


    for (var i = 0; i < parts.length; i++) {

        var part = parts[i];


        /*
            Диапазон:
            1-17
            2-16
        */

        if (part.indexOf("-") !== -1) {

            var range = part.split("-");

            var start = Number(range[0]);
            var end = Number(range[1]);


            if (
                !isNaN(start) &&
                !isNaN(end) &&
                weekNumber >= start &&
                weekNumber <= end
            ) {
                return true;
            }


        } else {

            /*
                Отдельная неделя:
                2,4,6,8
            */

            var week = Number(part);

            if (
                !isNaN(week) &&
                week === weekNumber
            ) {
                return true;
            }
        }
    }


    return false;
}


/* ==============================
   ПОКАЗ РАСПИСАНИЯ
   ============================== */

function showSchedule(group) {

    if (
        !scheduleData ||
        !Array.isArray(scheduleData.schedule)
    ) {
        console.error("schedule не найден");
        return;
    }


    scheduleContainer.innerHTML = "";


    var weekInfo = getWeekInfo();


    /*
        ВАЖНО!

        КОДЫ API КГМУ:

        1 = воскресенье
        2 = понедельник
        3 = вторник
        4 = среда
        5 = четверг
        6 = пятница
        7 = суббота
    */

    var days = [
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


    /* ==============================
       ЗАГОЛОВОК НЕДЕЛИ
       ============================== */

    var weekHeader =
        document.createElement("div");

    weekHeader.className =
        "week-header";

    weekHeader.innerHTML =
        "<h2>Неделя №" +
        weekInfo.weekNumber +
        "</h2>" +

        "<p>" +
        formatDate(weekInfo.monday) +
        " — " +
        formatDate(weekInfo.sunday) +
        "</p>";


    scheduleContainer.appendChild(
        weekHeader
    );


    /* ==============================
       ДНИ НЕДЕЛИ
       ============================== */

    days.forEach(function(day) {


        /*
            Находим занятия:
            1. нужный день
            2. нужная группа
            3. нужная учебная неделя
        */

        var lessons =
            scheduleData.schedule.filter(
                function(lesson) {

                    var correctDay =
                        Number(lesson.wd) === day.number;


                    var correctGroup =
                        Array.isArray(lesson.sg) &&
                        lesson.sg.some(
                            function(item) {

                                return String(item) ===
                                    String(group);
                            }
                        );


                    var correctWeek =
                        isLessonInWeek(
                            lesson,
                            weekInfo.weekNumber
                        );


                    return (
                        correctDay &&
                        correctGroup &&
                        correctWeek
                    );
                }
            );


        /*
            Блок дня.
        */

        var dayBlock =
            document.createElement("div");

        dayBlock.className = "day";


        var dayTitle =
            document.createElement("h3");

        dayTitle.textContent =
            day.name;

        dayBlock.appendChild(
            dayTitle
        );


        /*
            Если занятий нет.
        */

        if (lessons.length === 0) {

            var empty =
                document.createElement("p");

            empty.textContent =
                "Занятий нет";

            empty.className =
                "no-lessons";

            dayBlock.appendChild(
                empty
            );


        } else {


            /*
                Сортируем занятия
                по времени начала.
            */

            lessons.sort(
                function(a, b) {

                    return String(a.ts || "")
                        .localeCompare(
                            String(b.ts || "")
                        );
                }
            );


            /*
                Выводим занятия.
            */

            lessons.forEach(
                function(lesson) {

                    var lessonElement =
                        document.createElement("div");

                    lessonElement.className =
                        "lesson";


                    var lessonType = "";


                    if (Number(lesson.lt) === 102) {

                        lessonType = "Лекция";

                    } else if (
                        Number(lesson.lt) === 103
                    ) {

                        lessonType = "Практика";
                    }


                    var html = "";


                    html +=
                        "<div class='lesson-time'>" +
                        (lesson.ts || "") +
                        " – " +
                        (lesson.te || "") +
                        "</div>";


                    html +=
                        "<div class='lesson-subject'>" +
                        (lesson.ln || "") +
                        "</div>";


                    if (lessonType) {

                        html +=
                            "<div class='lesson-type'>" +
                            lessonType +
                            "</div>";
                    }


                    if (lesson.tn) {

                        html +=
                            "<div class='lesson-teacher'>" +
                            lesson.tn +
                            "</div>";
                    }


                    if (lesson.loc) {

                        html +=
                            "<div class='lesson-location'>" +
                            lesson.loc +
                            "</div>";
                    }


                    if (lesson.ws) {

                        html +=
                            "<div class='lesson-weeks'>" +
                            "Недели: " +
                            lesson.ws +
                            "</div>";
                    }


                    lessonElement.innerHTML =
                        html;


                    dayBlock.appendChild(
                        lessonElement
                    );
                }
            );
        }


        scheduleContainer.appendChild(
            dayBlock
        );
    });
}


/* ==============================
   ВЫБОР ГРУППЫ
   ============================== */

groupSelect.addEventListener(
    "change",
    function() {

        var selectedGroup =
            String(this.value);


        if (!selectedGroup) {

            scheduleContainer.innerHTML = "";

            return;
        }


        showSchedule(selectedGroup);
    }
);


/* ==============================
   ЗАПУСК
   ============================== */

loadSchedule();
