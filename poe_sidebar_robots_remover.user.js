// ==UserScript==
// @name         Poe.com Remove Robots from Sidebar
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Remove robots from the sidebar of poe.com, only show allowed robots
// @author       XZ and GPT-4
// @match        https://poe.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=poe.com
// @grant        none
// @homepage     https://github.com/xz-dev/poe_sidebar_robots_remover
// @downloadURL  https://raw.githubusercontent.com/xz-dev/poe_sidebar_robots_remover/main/poe_sidebar_robots_remover.js
// @updateURL    https://raw.githubusercontent.com/xz-dev/poe_sidebar_robots_remover/main/poe_sidebar_robots_remover.js
// ==/UserScript==

(function() {
    'use strict';

    const defaultRobotKeywords = ['Sage', 'GPT', 'Claude'];
    const defaultBlacklistedRobots = [];

    const ROBOT_KEYWORDS = JSON.parse(localStorage.getItem('robotKeywords')) || defaultRobotKeywords;
    const BLACKLISTED_ROBOTS = JSON.parse(localStorage.getItem('blacklistedRobots')) || defaultBlacklistedRobots;

    const hasPartialClass = (element, partialClassName) => {
        return Array.from(element.classList).some(className => className.includes(partialClassName));
    };

    const matchesKeywords = (name) => {
        return ROBOT_KEYWORDS.some(keyword => name.includes(keyword));
    };

    const isBlacklisted = (name) => {
        return BLACKLISTED_ROBOTS.includes(name);
    };

    const removeUnwantedSidebarItems = () => {
    const menu = Array.from(document.querySelectorAll('menu')).find((element) =>
        hasPartialClass(element, 'ChatPageSidebar_sidebar__')
    );

    if (menu) {
        const sidebarSections = Array.from(menu.querySelectorAll('section')).filter((element) =>
            hasPartialClass(element, 'PageWithSidebarNavGroup_section__')
        );

        sidebarSections.forEach((sidebarSection) => {
            const robotNavItems = Array.from(sidebarSection.querySelectorAll('a'));

            robotNavItems.forEach((navItem) => {
                if (hasPartialClass(navItem, 'PageWithSidebarNavItem_navItem__')) {
                    const robotNameElem = navItem.querySelector('div > div > p:not([class])');
                    if (robotNameElem) {
                        const robotName = robotNameElem.textContent.trim();
                        if (!matchesKeywords(robotName) || isBlacklisted(robotName)) {
                            navItem.remove();
                        }
                    }
                }
            });
        });
    }
    };

    const observer = new MutationObserver(removeUnwantedSidebarItems);

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });

    removeUnwantedSidebarItems();

    const createSettingsPanel = () => {
        const settingsPanel = document.createElement('div');
        settingsPanel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background-color: black;
            border: 1px solid black;
            padding: 15px;
            z-index: 1000;
            display: none;
        `;


        const settingsPanelToggleButton = document.createElement('button');
        settingsPanelToggleButton.textContent = 'List\nSetting';
        settingsPanelToggleButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1001;
        white-space: pre; // 保持换行符生效
        `;


        settingsPanelToggleButton.onclick = () => {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        };

        const saveSettings = () => {
            localStorage.setItem('robotKeywords', JSON.stringify(ROBOT_KEYWORDS));
            localStorage.setItem('blacklistedRobots', JSON.stringify(BLACKLISTED_ROBOTS));
        };

        const createSettings = (title, items, addItemCallback, removeItemCallback) => {
            const container = document.createElement('div');
            const heading = document.createElement('h3');
            heading.textContent = title;

            const list = document.createElement('ul');
            items.forEach((item, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                listItem.onclick = () => {
                    removeItemCallback(index);
                    container.replaceWith(createSettings(title, items, addItemCallback, removeItemCallback));
                };
                list.appendChild(listItem);
            });

            const input = document.createElement('input');
            input.type = 'text';

            const addButton = document.createElement('button');
            addButton.textContent = 'Add';
            addButton.onclick = () => {
                addItemCallback(input.value);
                container.replaceWith(createSettings(title, items, addItemCallback, removeItemCallback));
            };

            container.appendChild(heading);
            container.appendChild(list);
            container.appendChild(input);
            container.appendChild(addButton);

            return container;
        };

        const robotKeywordsSettings = createSettings(
            'Allowed Keywords',
            ROBOT_KEYWORDS,
            (keyword) => ROBOT_KEYWORDS.push(keyword),
            (index) => ROBOT_KEYWORDS.splice(index, 1)
        );

        const blacklistedRobotsSettings = createSettings(
            'Blacklisted Robots',
            BLACKLISTED_ROBOTS,
            (robotName) => BLACKLISTED_ROBOTS.push(robotName),
            (index) => BLACKLISTED_ROBOTS.splice(index, 1)
        );
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Settings';
        saveButton.onclick = () => {
            saveSettings();
            alert('Settings saved! Refresh the page to see the changes.');
        };

        settingsPanel.appendChild(robotKeywordsSettings);
        settingsPanel.appendChild(blacklistedRobotsSettings);
        settingsPanel.appendChild(saveButton);
        document.body.appendChild(settingsPanel);
        document.body.appendChild(settingsPanelToggleButton);
        };

    createSettingsPanel();

})();
