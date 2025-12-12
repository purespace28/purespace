"use client";

import { useEffect, useRef } from "react";

export default function DomestinaBadge() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Проверяваме дали скриптът вече е зареден
    const existingScript = document.querySelector(
      'script[src="https://www.domestina.bg/badge-js/1/pure-space.js"]'
    );

    const initBadge = () => {
      // Изчакваме контейнерът да се рендира
      if (!containerRef.current) return;

      // Проверяваме дали функциите са достъпни
      const win = window as any;
      if (win.domestina_addCss && win.domestina_addGlovesDiv && win.domestina_addVisitsDiv && win.domestina_addRatingDiv) {
        // Извикваме функциите за да инициализираме значката
        win.domestina_addCss();
        win.domestina_addGlovesDiv();
        win.domestina_addVisitsDiv();
        win.domestina_addRatingDiv();

        // Добавяме click handler за редирект
        const container = containerRef.current;
        if (container) {
          container.style.cursor = "pointer";
          const handleClick = () => {
            window.location.href = "https://www.domestina.bg/firma-za-pochistvane/w/pure-space";
          };
          container.addEventListener("click", handleClick);
        }
      }
    };

    if (!existingScript) {
      // Зареждаме скрипта динамично, само на клиента
      const script = document.createElement("script");
      script.src = "https://www.domestina.bg/badge-js/1/pure-space.js";
      script.async = true;
      script.id = "domestina-badge-script";
      
      script.onload = () => {
        // Изчакваме малко за да се уверя, че функциите са дефинирани
        setTimeout(initBadge, 50);
      };
      
      document.head.appendChild(script);
    } else {
      // Ако скриптът вече е зареден, извикваме функциите веднага
      setTimeout(initBadge, 50);
    }
  }, []);

  return (
    <div id="domestina_badge-container" ref={containerRef}>
      <div id="domestina_text-container">
        <div id="domestina_link-container">
          <a
            href="https://www.domestina.bg/firma-za-pochistvane/w/pure-space"
            className="domestina_no-hover"
            style={{ color: "black" }}
          >
            Domestina рейтинг
          </a>
        </div>
      </div>
    </div>
  );
}

