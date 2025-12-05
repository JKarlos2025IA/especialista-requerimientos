// app.js
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const conditionsFormContainer = document.getElementById('initial-conditions-form');
    const conditionsForm = document.getElementById('conditionsForm');
    const validationMessages = document.getElementById('validationMessages');
    const UIT_ACTUAL_VALUE = 5350; // Valor de la UIT 2025
    const TDR_UMBRAL = UIT_ACTUAL_VALUE * 8; // Umbral para TDR de servicios (8 UIT)

    console.log('app.js cargado. Listo para Ficha #1.0');

    // Store metas data globally or pass it around
    let allMetasData = [];
    let allServiciosData = [];
    let clausulasPersonalizadas = []; // Array para almacenar cláusulas custom
    let globalParsedSections = []; // Para acceder a la estructura desde cualquier lugar

    // Verificar si hay datos temporales del sessionStorage (regreso de vista previa)
    const datosTemporales = sessionStorage.getItem('tdr_datos_temporales');
    if (datosTemporales) {
        console.log('Datos temporales detectados. Restaurando formulario...');
        // Cargar formulario directamente con los datos guardados
        setTimeout(() => {
            restaurarFormularioConDatos(JSON.parse(datosTemporales));
        }, 100);
    }

    // --- Helper Functions for Control Generation (Ficha #2.0, Sub-tarea 2.4) ---
    function createTextInput(id, label, initialValue = '', isTextArea = false, placeholder = '', readOnly = false, required = false) {
        const div = document.createElement('div');
        div.className = 'form-group';
        const lbl = document.createElement('label');
        lbl.htmlFor = id;
        lbl.textContent = label;

        // Agregar asterisco rojo si es requerido
        if (required) {
            const asterisco = document.createElement('span');
            asterisco.className = 'required';
            asterisco.textContent = ' *';
            lbl.appendChild(asterisco);
        }

        div.appendChild(lbl);

        let input;
        if (isTextArea) {
            input = document.createElement('textarea');
            input.rows = 4;
        } else {
            input = document.createElement('input');
            input.type = 'text';
        }
        input.id = id;
        input.name = id;
        input.value = initialValue;
        input.placeholder = placeholder;
        input.readOnly = readOnly;
        if (required) {
            input.setAttribute('data-required', 'true');
        }
        div.appendChild(input);
        return div;
    }

    function createDatalistInput(id, label, dataList, placeholder = '', required = false) {
        const div = document.createElement('div');
        div.className = 'form-group';

        const lbl = document.createElement('label');
        lbl.htmlFor = id;
        lbl.textContent = label;

        if (required) {
            const asterisco = document.createElement('span');
            asterisco.className = 'required';
            asterisco.textContent = ' *';
            lbl.appendChild(asterisco);
        }

        div.appendChild(lbl);

        const input = document.createElement('input');
        input.type = 'text';
        input.id = id;
        input.name = id;
        input.placeholder = placeholder;
        input.setAttribute('list', `${id}-datalist`);

        if (required) {
            input.setAttribute('data-required', 'true');
        }

        const datalist = document.createElement('datalist');
        datalist.id = `${id}-datalist`;

        dataList.forEach(item => {
            const option = document.createElement('option');
            option.value = `${item.codigo} - ${item.titulo}`;
            datalist.appendChild(option);
        });

        div.appendChild(input);
        div.appendChild(datalist);

        return div;
    }

    function createNumberInput(id, label, initialValue = '', min = 0, step = 1, placeholder = '') {
        const div = document.createElement('div');
        div.className = 'form-group';
        const lbl = document.createElement('label');
        lbl.htmlFor = id;
        lbl.textContent = label;
        div.appendChild(lbl);

        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.name = id;
        input.value = initialValue;
        input.min = min;
        input.step = step;
        input.placeholder = placeholder;
        div.appendChild(input);
        return div;
    }

    function createRadioGroup(name, label, options, initialValue = '') {
        const div = document.createElement('div');
        div.className = 'form-group';
        const lbl = document.createElement('label');
        lbl.textContent = label;
        div.appendChild(lbl);

        options.forEach(opt => {
            const radioDiv = document.createElement('div');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `${name}_${opt.value}`;
            radio.name = name;
            radio.value = opt.value;
            if (opt.value === initialValue) {
                radio.checked = true;
            }
            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = `${name}_${opt.value}`;
            radioLabel.textContent = opt.text;
            radioDiv.appendChild(radio);
            radioDiv.appendChild(radioLabel);
            div.appendChild(radioDiv);
        });
        return div;
    }

    function createCheckbox(id, label, initialChecked = false) {
        const div = document.createElement('div');
        div.className = 'form-group form-group-checkbox';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.name = id;
        checkbox.checked = initialChecked;
        const lbl = document.createElement('label');
        lbl.htmlFor = id;
        lbl.textContent = label;
        div.appendChild(checkbox);
        div.appendChild(lbl);
        return div;
    }

    function createSelectInput(id, label, options, initialValue = '', placeholder = '', multiple = false, required = false) {
        const div = document.createElement('div');
        div.className = 'form-group';
        const lbl = document.createElement('label');
        lbl.htmlFor = id;
        lbl.textContent = label;

        // Agregar asterisco rojo si es requerido
        if (required) {
            const asterisco = document.createElement('span');
            asterisco.className = 'required';
            asterisco.textContent = ' *';
            lbl.appendChild(asterisco);
        }

        div.appendChild(lbl);

        const select = document.createElement('select');
        select.id = id;
        select.name = id;
        select.multiple = multiple;
        if (required) {
            select.setAttribute('data-required', 'true');
        }

        if (placeholder) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = placeholder;
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);
        }

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            if (opt.value === initialValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        div.appendChild(select);
        return div;
    }
    // --- End Helper Functions ---


    // --- Ficha #2.0, Sub-tarea 2.3: Implementación de la Lógica de "Meta Presupuestaria" y "Actividad del POI" ---
    async function fetchMetasData() {
        try {
            const response = await fetch('data/metas-entidad.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allMetasData = await response.json();
            console.log('Datos de metas cargados:', allMetasData);
            return allMetasData;
        } catch (error) {
            console.error('Error al cargar datos de metas:', error);
            // Optionally display error to user
            return [];
        }
    }

    async function fetchServiciosData() {
        try {
            const response = await fetch('data/CUBSO_SERVICIOS.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();
            const lines = csvText.trim().split('\n');

            // Saltar header (primera línea)
            allServiciosData = lines.slice(1).map(line => {
                const [codigo, titulo] = line.split(',');
                return {
                    codigo: codigo?.trim() || '',
                    titulo: titulo?.trim() || ''
                };
            }).filter(item => item.codigo && item.titulo);

            console.log(`Datos de servicios CUBSO cargados: ${allServiciosData.length} items`);
            return allServiciosData;
        } catch (error) {
            console.error('Error al cargar datos de servicios CUBSO:', error);
            return [];
        }
    }

    // --- Ficha #2.0, Sub-tarea 2.1: Carga y Procesamiento de la Plantilla ---
    async function loadAndParseTemplate(templatePath) {
        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            console.log("Plantilla cargada correctamente");

            const sections = [];
            const lines = markdown.split('\n');
            let currentSection = null;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Detectar secciones principales con ##
                if (line.startsWith('## ')) {
                    // Guardar seccion anterior si existe
                    if (currentSection) {
                        sections.push(currentSection);
                    }

                    const titleText = line.replace('##', '').trim();

                    // Crear nueva seccion
                    currentSection = {
                        id: titleText.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
                        title: titleText,
                        content: '',
                        instructivo: '',
                        subsecciones: []
                    };
                }
                // Detectar subsecciones con ###
                else if (line.startsWith('### ')) {
                    if (currentSection) {
                        const subTitle = line.replace('###', '').trim();
                        currentSection.subsecciones.push({
                            title: subTitle,
                            content: '',
                            instructivo: ''
                        });
                    }
                }
                // Detectar instructivos
                else if (line.startsWith('**Instructivo:**')) {
                    const instructivo = line.replace('**Instructivo:**', '').trim();
                    if (currentSection) {
                        if (currentSection.subsecciones.length > 0) {
                            currentSection.subsecciones[currentSection.subsecciones.length - 1].instructivo = instructivo;
                        } else {
                            currentSection.instructivo = instructivo;
                        }
                    }
                }
                // Detectar contenido predefinido
                else if (line.startsWith('**Contenido:**')) {
                    const contenido = line.replace('**Contenido:**', '').trim();
                    if (currentSection) {
                        // Solo agregar si hay contenido en la misma línea
                        if (contenido) {
                            if (currentSection.subsecciones.length > 0) {
                                currentSection.subsecciones[currentSection.subsecciones.length - 1].content = contenido;
                            } else {
                                currentSection.content = contenido;
                            }
                        }
                        // Marcar que estamos capturando contenido (incluso si la línea está vacía)
                        currentSection.capturandoContenido = true;
                    }
                }
                // Detectar notas
                else if (line.startsWith('**Nota:**')) {
                    const nota = line.replace('**Nota:**', '').trim();
                    if (currentSection) {
                        currentSection.nota = nota;
                        currentSection.capturandoContenido = false;
                    }
                }
                // Detectar opciones
                else if (line.startsWith('**Opciones:**')) {
                    if (currentSection) {
                        // Determinar si es para la sección principal o una subsección
                        let targetObj = currentSection;
                        if (currentSection.subsecciones.length > 0) {
                            targetObj = currentSection.subsecciones[currentSection.subsecciones.length - 1];
                        }
                        targetObj.options = [];
                        targetObj.capturandoOpciones = true;
                        targetObj.capturandoContenido = false; // Dejar de capturar contenido
                    }
                }
                // Detectar items de opciones (+)
                else if (line.startsWith('+') && currentSection) {
                    let targetObj = currentSection;
                    if (currentSection.subsecciones.length > 0) {
                        targetObj = currentSection.subsecciones[currentSection.subsecciones.length - 1];
                    }

                    if (targetObj.capturandoOpciones) {
                        const optionText = line.replace('+', '').trim();
                        // Crear valor simple para el value (slug)
                        const optionValue = optionText.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
                        targetObj.options.push({
                            value: optionValue,
                            text: optionText,
                            isOther: optionText.toLowerCase().includes('otros (para escribir)') || optionText.toLowerCase().includes('otro (especifique)')
                        });
                    }
                }
                // Acumular contenido de parrafos
                else if (line && !line.startsWith('#') && !line.startsWith('**') && currentSection) {
                    // Si estamos capturando contenido después de **Contenido:**
                    if (currentSection.capturandoContenido) {
                        // Agregar salto de línea entre párrafos
                        if (currentSection.content) {
                            currentSection.content += '\n\n' + line;
                        } else {
                            currentSection.content = line;
                        }
                    }
                    // Si no hay instructivo ni contenido definido, acumular
                    else if (currentSection.subsecciones.length > 0) {
                        const lastSub = currentSection.subsecciones[currentSection.subsecciones.length - 1];
                        // Si estamos capturando opciones, ignorar texto plano que no empiece con +
                        if (!lastSub.capturandoOpciones && !lastSub.instructivo && !lastSub.content) {
                            lastSub.content += (lastSub.content ? ' ' : '') + line;
                        }
                    } else if (!currentSection.instructivo && !currentSection.content && !currentSection.capturandoOpciones) {
                        currentSection.content += (currentSection.content ? ' ' : '') + line;
                    }
                }
            }

            // Agregar ultima seccion
            if (currentSection) {
                sections.push(currentSection);
            }

            console.log('Secciones parseadas:', sections.length);
            globalParsedSections = sections; // Guardar referencia global
            return sections;

        } catch (error) {
            console.error('Error al cargar o parsear la plantilla:', error);
            validationMessages.textContent = 'Error al cargar la plantilla. Intente de nuevo mas tarde.';
            return [];
        }
    }

    // --- Ficha #2.0, Sub-tarea 2.2 & 2.4: Generación Dinámica del Formulario (Estructura General & Controles Restantes) ---
    async function renderInteractiveForm(parsedSections) {
        appContainer.innerHTML = ''; // Clear previous content

        const formTitle = document.createElement('h2');
        formTitle.textContent = 'Formulario Interactivo de Términos de Referencia';
        appContainer.appendChild(formTitle);

        const formElement = document.createElement('form');
        formElement.id = 'tdaInteractiveForm';
        appContainer.appendChild(formElement);

        if (allMetasData.length === 0) {
            await fetchMetasData();
        }

        if (allServiciosData.length === 0) {
            await fetchServiciosData();
        }

        console.log('TODAS LAS SECCIONES PARSEADAS:', parsedSections.map(s => s.id));

        parsedSections.forEach((section, index) => {
            console.log('Procesando seccion:', section.id, section.title);

            // Crear contenedor del item de acordeón
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            accordionItem.id = `accordion-${section.id}`;

            // Crear encabezado del acordeón
            const accordionHeader = document.createElement('div');
            accordionHeader.className = 'accordion-header';

            // Botón "+" en el Header (Para agregar cláusulas adicionales)
            const btnHeaderAdd = document.createElement('button');
            btnHeaderAdd.textContent = '+';
            btnHeaderAdd.className = 'btn-header-add';
            btnHeaderAdd.title = 'Agregar Cláusula Adicional';
            // Evento se define más abajo cuando contentWrapper exista

            // Título (Numerales en Azul) - QUITANDO NUMERACIÓN AUTOMÁTICA DEL MARKDOWN
            const title = document.createElement('h3');
            // Regex para quitar "1. ", "2.1 ", etc. al inicio
            title.textContent = section.title.replace(/^\d+(\.\d+)*\s*/, '');

            accordionHeader.appendChild(btnHeaderAdd); // Insertar botón + antes del título
            accordionHeader.appendChild(title);

            // Icono de flecha
            const icon = document.createElement('span');
            icon.className = 'accordion-icon';
            icon.textContent = '▼';
            accordionHeader.appendChild(icon);

            // Evento click para abrir/cerrar
            accordionHeader.addEventListener('click', (e) => {
                // Si el click fue en el botón +, no hacer toggle aquí (se maneja en su propio evento)
                if (e.target === btnHeaderAdd) return;

                // Cerrar otros (opcional, si queremos comportamiento de acordeón estricto)
                // document.querySelectorAll('.accordion-item').forEach(item => {
                //     if (item !== accordionItem) item.classList.remove('active');
                // });
                accordionItem.classList.toggle('active');
            });

            accordionItem.appendChild(accordionHeader);

            // Crear contenido del acordeón
            const accordionContent = document.createElement('div');
            accordionContent.className = 'accordion-content';

            // Opción "No Aplica"
            const noAplicaContainer = document.createElement('div');
            noAplicaContainer.className = 'no-aplica-container';
            const noAplicaCheckbox = document.createElement('input');
            noAplicaCheckbox.type = 'checkbox';
            noAplicaCheckbox.id = `noAplica_${section.id}`;
            noAplicaCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    contentWrapper.classList.add('section-disabled');
                    // Deshabilitar inputs internos
                    contentWrapper.querySelectorAll('input, select, textarea').forEach(el => el.disabled = true);
                } else {
                    contentWrapper.classList.remove('section-disabled');
                    // Habilitar inputs internos
                    contentWrapper.querySelectorAll('input, select, textarea').forEach(el => el.disabled = false);
                }
            });
            const noAplicaLabel = document.createElement('label');
            noAplicaLabel.htmlFor = `noAplica_${section.id}`;
            noAplicaLabel.textContent = 'No Aplica / Eliminar esta sección';
            noAplicaContainer.appendChild(noAplicaCheckbox);
            noAplicaContainer.appendChild(noAplicaLabel);
            accordionContent.appendChild(noAplicaContainer);

            // Wrapper para el contenido real (para poder deshabilitarlo)
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'section-content-wrapper';
            accordionContent.appendChild(contentWrapper);

            // Lógica del Botón + del Header
            btnHeaderAdd.onclick = (e) => {
                e.stopPropagation();
                accordionItem.classList.add('active'); // Abrir si está cerrado

                // Crear Cláusula Adicional
                const clauseWrapper = document.createElement('div');
                clauseWrapper.className = 'dynamic-clause-wrapper';
                clauseWrapper.style.marginTop = '15px';
                clauseWrapper.style.borderLeft = '2px solid #666';
                clauseWrapper.style.paddingLeft = '10px';
                clauseWrapper.style.background = 'rgba(255, 255, 255, 0.05)';
                clauseWrapper.style.padding = '10px';

                const numContainer = document.createElement('div');
                numContainer.style.marginBottom = '5px'; numContainer.style.display = 'flex'; numContainer.style.alignItems = 'center';
                const numCheck = document.createElement('input');
                numCheck.type = 'checkbox'; numCheck.className = 'dynamic-clause-numbered'; numCheck.checked = true; numCheck.id = `chk_${Date.now()}`;
                const numLabel = document.createElement('label');
                numLabel.htmlFor = numCheck.id; numLabel.textContent = 'Numerar (x.y)'; numLabel.style.marginLeft = '5px'; numLabel.style.color = '#ccc';
                numContainer.appendChild(numCheck); numContainer.appendChild(numLabel);

                const clTitleInput = document.createElement('input');
                clTitleInput.type = 'text'; clTitleInput.className = 'dynamic-clause-title'; clTitleInput.placeholder = 'Título Cláusula Adicional'; clTitleInput.style.width = '100%'; clTitleInput.style.marginBottom = '5px'; clTitleInput.style.background = '#333'; clTitleInput.style.color = '#fff'; clTitleInput.style.border = '1px solid #555';

                const clContentInput = document.createElement('textarea');
                clContentInput.className = 'dynamic-clause-content'; clContentInput.rows = 3; clContentInput.placeholder = 'Contenido...'; clContentInput.style.width = '100%';

                const btnRemoveCl = document.createElement('button');
                btnRemoveCl.textContent = 'Eliminar';
                btnRemoveCl.type = 'button'; btnRemoveCl.style.background = '#ff6b6b'; btnRemoveCl.style.color = 'white'; btnRemoveCl.style.border = 'none'; btnRemoveCl.style.marginTop = '5px';
                btnRemoveCl.onclick = () => { clauseWrapper.remove(); updateLivePreview(); };

                clauseWrapper.appendChild(numContainer); clauseWrapper.appendChild(clTitleInput); clauseWrapper.appendChild(clContentInput); clauseWrapper.appendChild(btnRemoveCl);

                // Insertar antes del botón flotante inferior si existe, o al final
                const btnFloating = contentWrapper.querySelector('.btn-add-floating');
                if (btnFloating && btnFloating.parentElement.classList.contains('add-options-menu') === false) {
                    // Ojo: btnFloating suele estar dentro de un div contenedor o suelto.
                    // En mi implementación anterior, btnAdd se agregaba al final.
                    // Mejor insertar antes del último hijo si es botón, o simplemente append.
                    contentWrapper.insertBefore(clauseWrapper, null); // Al final por defecto
                } else {
                    contentWrapper.appendChild(clauseWrapper);
                }

                updateLivePreview();

                // Scroll suave hacia la nueva cláusula
                setTimeout(() => {
                    clauseWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    clTitleInput.focus();
                }, 100);
            };

            // Agregar instructivo si existe
            if (section.instructivo) {
                const instr = document.createElement('p');
                instr.className = 'instructivo';
                instr.textContent = section.instructivo;
                contentWrapper.appendChild(instr);
            }

            // --- Lógica de renderizado de controles (similar a la anterior pero dentro de contentWrapper) ---
            const sectionDiv = contentWrapper; // Usamos contentWrapper como el contenedor de controles

            // Dynamically add controls based on section content and title
            if (section.id === 'general_data' || section.id === 'datos_generales') {
                // ... (Lógica existente para Datos Generales) ...
                sectionDiv.appendChild(createDatalistInput('item', 'Item (Servicio CUBSO):', allServiciosData, 'Buscar por código o descripción...', true));
                sectionDiv.appendChild(createSelectInput('metaPresupuestaria', 'Meta Presupuestaria:', allMetasData.map(meta => ({ value: meta.id, text: meta.nombre })), '', 'Seleccione una Meta', false, true));
                const metaSelect = sectionDiv.querySelector('#metaPresupuestaria');
                sectionDiv.appendChild(createTextInput('unidadOrganizacion', 'Unidad de Organización:', '', false, '', true));
                const unidadInput = sectionDiv.querySelector('#unidadOrganizacion');
                sectionDiv.appendChild(createSelectInput('actividadPOI', 'Actividad del POI:', [], '', 'Seleccione actividades', true, true));
                const actividadSelect = sectionDiv.querySelector('#actividadPOI');
                actividadSelect.setAttribute('multiple', 'true');
                actividadSelect.setAttribute('size', '5');
                sectionDiv.appendChild(createTextInput('denominacionContratacion', 'Denominación de la Contratación:', '', false, 'Ingrese la denominación del servicio', false, true));

                metaSelect.addEventListener('change', (event) => {
                    const selectedMetaId = event.target.value;
                    const selectedMeta = allMetasData.find(meta => meta.id === selectedMetaId);
                    unidadInput.value = selectedMeta ? selectedMeta.unidad : '';
                    actividadSelect.innerHTML = '';
                    if (selectedMeta && selectedMeta.actividades) {
                        selectedMeta.actividades.forEach(act => {
                            const option = document.createElement('option');
                            option.value = act.id;
                            option.textContent = act.nombre;
                            actividadSelect.appendChild(option);
                        });
                    }
                });

                // Datos generales siempre visible y sin "No Aplica"
                accordionItem.classList.add('active');
                noAplicaContainer.style.display = 'none';

            } else if (section.options && section.options.length > 0) {
                // SECCIÓN CON OPCIONES DINÁMICAS
                const radioGroup = createRadioGroup(`opciones_${section.id}`, 'Seleccione una opción:', section.options, section.options[0].value);
                sectionDiv.appendChild(radioGroup);

                const otherOption = section.options.find(opt => opt.isOther);
                if (otherOption) {
                    const otherInputId = `opcionesOtro_${section.id}`;
                    const otherInput = createTextInput(otherInputId, 'Especifique:', '', false, 'Ingrese el detalle aquí');
                    otherInput.style.display = 'none';
                    sectionDiv.appendChild(otherInput);

                    const radios = sectionDiv.querySelectorAll(`input[name="opciones_${section.id}"]`);
                    radios.forEach(radio => {
                        radio.addEventListener('change', (e) => {
                            if (e.target.value === otherOption.value) {
                                otherInput.style.display = 'block';
                                otherInput.querySelector('input').focus();
                            } else {
                                otherInput.style.display = 'none';
                            }
                        });
                    });
                }
            } else if (section.subsecciones && section.subsecciones.length > 0) {
                // SECCIÓN CON SUBSECCIONES
                section.subsecciones.forEach(sub => {
                    const subTitle = document.createElement('h4');
                    subTitle.textContent = sub.title;
                    subTitle.style.color = '#4dabf7'; // Azul
                    subTitle.style.marginTop = '20px';
                    sectionDiv.appendChild(subTitle);

                    if (sub.instructivo) {
                        const instr = document.createElement('p');
                        instr.className = 'instructivo';
                        instr.textContent = sub.instructivo;
                        sectionDiv.appendChild(instr);
                    }

                    if (sub.options && sub.options.length > 0) {
                        const subId = sub.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        const radioGroup = createRadioGroup(`opciones_${section.id}_${subId}`, '', sub.options, sub.options[0].value);
                        sectionDiv.appendChild(radioGroup);

                        // Lógica "Otros" para subsecciones
                        const otherOption = sub.options.find(opt => opt.isOther);
                        if (otherOption) {
                            const otherInputId = `opcionesOtro_${section.id}_${subId}`;
                            const otherInput = createTextInput(otherInputId, 'Especifique:', '', false, 'Ingrese el detalle aquí');
                            otherInput.style.display = 'none';
                            sectionDiv.appendChild(otherInput);

                            const radios = sectionDiv.querySelectorAll(`input[name="opciones_${section.id}_${subId}"]`);
                            radios.forEach(radio => {
                                radio.addEventListener('change', (e) => {
                                    if (e.target.value === otherOption.value) {
                                        otherInput.style.display = 'block';
                                        otherInput.querySelector('input').focus();
                                    } else {
                                        otherInput.style.display = 'none';
                                    }
                                });
                            });
                        }

                    } else {
                        sectionDiv.appendChild(createTextInput(`sub_${section.id}_${sub.title}`, sub.title + ':', sub.content, true));
                    }
                });
            } else {
                // Fallback normal
                sectionDiv.appendChild(createTextInput(`content_${section.id}`, 'Contenido:', section.content, true));
            }

            // Botón "+" para agregar contenido extra (Menú Despegable)
            const btnAdd = document.createElement('button');
            btnAdd.className = 'btn-add-floating';
            btnAdd.textContent = '+';
            btnAdd.type = 'button';
            btnAdd.title = 'Agregar contenido';

            // Contenedor del menú de opciones (oculto por defecto)
            const optionsMenu = document.createElement('div');
            optionsMenu.className = 'add-options-menu';
            optionsMenu.style.display = 'none';
            optionsMenu.style.marginTop = '5px';
            optionsMenu.style.background = '#2d2d2d';
            optionsMenu.style.border = '1px solid #444';
            optionsMenu.style.borderRadius = '4px';
            optionsMenu.style.padding = '5px';
            optionsMenu.style.position = 'absolute';
            optionsMenu.style.zIndex = '100';

            // Opción 1: Agregar Subsección (x.y)
            const btnAddSubsection = document.createElement('button');
            btnAddSubsection.textContent = '📑 Agregar Sub-sección (x.y)';
            btnAddSubsection.type = 'button'; // EVITAR SUBMIT
            btnAddSubsection.style.display = 'block';
            btnAddSubsection.style.width = '100%';
            btnAddSubsection.style.textAlign = 'left';
            btnAddSubsection.style.background = 'transparent';
            btnAddSubsection.style.color = '#e0e0e0';
            btnAddSubsection.style.border = 'none';
            btnAddSubsection.style.padding = '8px';
            btnAddSubsection.style.cursor = 'pointer';
            btnAddSubsection.onmouseover = () => btnAddSubsection.style.background = '#444';
            btnAddSubsection.onmouseout = () => btnAddSubsection.style.background = 'transparent';

            btnAddSubsection.onclick = (e) => {
                e.preventDefault(); // Doble seguridad
                e.stopPropagation();
                optionsMenu.style.display = 'none';

                // Crear Wrapper de Subsección
                const subWrapper = document.createElement('div');
                subWrapper.className = 'dynamic-subsection-wrapper';
                subWrapper.style.marginTop = '15px';
                subWrapper.style.borderLeft = '3px solid #4dabf7';
                subWrapper.style.paddingLeft = '15px';
                subWrapper.style.background = 'rgba(77, 171, 247, 0.05)';
                subWrapper.style.padding = '10px';
                subWrapper.style.borderRadius = '4px';

                // Input Título
                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.className = 'dynamic-subsection-title';
                titleInput.placeholder = 'Título de la Sub-sección (ej. Entregables)';
                titleInput.style.fontWeight = 'bold';
                titleInput.style.marginBottom = '10px';
                titleInput.style.width = '100%';

                // Textarea Contenido
                const contentInput = document.createElement('textarea');
                contentInput.className = 'dynamic-subsection-content';
                contentInput.placeholder = 'Contenido de la sub-sección...';
                contentInput.rows = 3;
                contentInput.style.width = '100%';

                // Botón Eliminar
                const btnRemove = document.createElement('button');
                btnRemove.textContent = 'Eliminar Sub-sección';
                btnRemove.type = 'button'; // EVITAR SUBMIT
                btnRemove.style.background = '#ff6b6b';
                btnRemove.style.color = 'white';
                btnRemove.style.border = 'none';
                btnRemove.style.padding = '5px 10px';
                btnRemove.style.marginTop = '5px';
                btnRemove.style.cursor = 'pointer';
                btnRemove.onclick = () => {
                    subWrapper.remove();
                    updateLivePreview();
                };

                subWrapper.appendChild(titleInput);
                subWrapper.appendChild(contentInput);
                subWrapper.appendChild(btnRemove);

                // Insertar antes del botón +
                contentWrapper.insertBefore(subWrapper, btnContainer); // Insertar antes del contenedor del botón
                updateLivePreview();
            };

            // Opción 2: Agregar Cláusula (Título + Contenido)
            const btnAddClause = document.createElement('button');
            btnAddClause.textContent = '📝 Agregar Cláusula (Título + Texto)';
            btnAddClause.type = 'button'; // EVITAR SUBMIT
            btnAddClause.style.display = 'block';
            btnAddClause.style.width = '100%';
            btnAddClause.style.textAlign = 'left';
            btnAddClause.style.background = 'transparent';
            btnAddClause.style.color = '#e0e0e0';
            btnAddClause.style.border = 'none';
            btnAddClause.style.padding = '8px';
            btnAddClause.style.cursor = 'pointer';
            btnAddClause.onmouseover = () => btnAddClause.style.background = '#444';
            btnAddClause.onmouseout = () => btnAddClause.style.background = 'transparent';

            btnAddClause.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                optionsMenu.style.display = 'none';

                // Crear Wrapper de Cláusula
                const clauseWrapper = document.createElement('div');
                clauseWrapper.className = 'dynamic-clause-wrapper';
                clauseWrapper.style.marginTop = '15px';
                clauseWrapper.style.borderLeft = '2px solid #666';
                clauseWrapper.style.paddingLeft = '10px';
                clauseWrapper.style.background = 'rgba(255, 255, 255, 0.05)';
                clauseWrapper.style.padding = '10px';
                clauseWrapper.style.borderRadius = '4px';

                // Checkbox Numeración Automática
                const numberingContainer = document.createElement('div');
                numberingContainer.style.marginBottom = '5px';
                numberingContainer.style.display = 'flex';
                numberingContainer.style.alignItems = 'center';

                const numberingCheckbox = document.createElement('input');
                numberingCheckbox.type = 'checkbox';
                numberingCheckbox.className = 'dynamic-clause-numbered';
                numberingCheckbox.checked = true; // Por defecto numerado
                numberingCheckbox.id = `num_chk_${Date.now()}`;

                const numberingLabel = document.createElement('label');
                numberingLabel.htmlFor = numberingCheckbox.id;
                numberingLabel.textContent = 'Numerar automáticamente (x.y)';
                numberingLabel.style.marginLeft = '5px';
                numberingLabel.style.fontSize = '0.9em';
                numberingLabel.style.color = '#ccc';
                numberingLabel.style.cursor = 'pointer';

                numberingContainer.appendChild(numberingCheckbox);
                numberingContainer.appendChild(numberingLabel);

                // Input Título (Opcional pero recomendado)
                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.className = 'dynamic-clause-title';
                titleInput.placeholder = 'Título de la Cláusula (ej. Penalidades)';
                titleInput.style.fontWeight = 'bold';
                titleInput.style.marginBottom = '5px';
                titleInput.style.width = '100%';
                titleInput.style.border = '1px solid #555';
                titleInput.style.background = '#333';
                titleInput.style.color = '#fff';
                titleInput.style.padding = '5px';

                // Textarea Contenido
                const contentInput = document.createElement('textarea');
                contentInput.className = 'dynamic-clause-content';
                contentInput.rows = 3;
                contentInput.placeholder = 'Contenido de la cláusula...';
                contentInput.style.width = '100%';
                contentInput.style.marginTop = '5px';

                // Botón Eliminar
                const btnRemove = document.createElement('button');
                btnRemove.textContent = 'Eliminar';
                btnRemove.type = 'button';
                btnRemove.style.background = '#ff6b6b';
                btnRemove.style.color = 'white';
                btnRemove.style.border = 'none';
                btnRemove.style.padding = '5px 10px';
                btnRemove.style.marginTop = '5px';
                btnRemove.style.cursor = 'pointer';
                btnRemove.onclick = () => {
                    clauseWrapper.remove();
                    updateLivePreview();
                };

                clauseWrapper.appendChild(numberingContainer);
                clauseWrapper.appendChild(titleInput);
                clauseWrapper.appendChild(contentInput);
                clauseWrapper.appendChild(btnRemove);

                contentWrapper.insertBefore(clauseWrapper, btnContainer);
                updateLivePreview();
            };

            optionsMenu.appendChild(btnAddSubsection);
            optionsMenu.appendChild(btnAddClause);

            // Toggle Menú
            btnAdd.onclick = (e) => {
                e.stopPropagation();
                const isVisible = optionsMenu.style.display === 'block';
                optionsMenu.style.display = isVisible ? 'none' : 'block';
            };

            // Cerrar menú al hacer click fuera
            document.addEventListener('click', () => {
                optionsMenu.style.display = 'none';
            });

            // Wrapper para botón y menú
            const btnContainer = document.createElement('div');
            btnContainer.style.position = 'relative';
            btnContainer.style.marginTop = '15px';

            btnContainer.appendChild(btnAdd);
            btnContainer.appendChild(optionsMenu);
            contentWrapper.appendChild(btnContainer);

            accordionItem.appendChild(accordionContent);
            formElement.appendChild(accordionItem);
        });

        // ==========================================
        // BOTÓN: AGREGAR NUEVA SECCIÓN PRINCIPAL
        // ==========================================
        const btnAddMainSection = document.createElement('button');
        btnAddMainSection.textContent = '➕ Agregar Nueva Sección Principal';
        btnAddMainSection.className = 'btn-primary';
        btnAddMainSection.style.marginTop = '20px';
        btnAddMainSection.style.marginBottom = '20px';
        btnAddMainSection.style.width = '100%';
        btnAddMainSection.style.background = '#28a745';
        btnAddMainSection.style.border = 'none';
        btnAddMainSection.style.padding = '12px';
        btnAddMainSection.style.fontSize = '1em';
        btnAddMainSection.style.cursor = 'pointer';
        btnAddMainSection.style.borderRadius = '5px';
        btnAddMainSection.type = 'button';

        btnAddMainSection.onmouseover = () => btnAddMainSection.style.background = '#218838';
        btnAddMainSection.onmouseout = () => btnAddMainSection.style.background = '#28a745';

        // ==========================================
        // LÓGICA MODAL NUEVA SECCIÓN
        // ==========================================
        const modalNuevaSeccion = document.getElementById('modalNuevaSeccion');
        const btnGuardarNuevaSeccion = document.getElementById('btnGuardarNuevaSeccion');
        const closeModalSeccion = document.getElementById('closeModalSeccion');
        const inputNewSectionTitle = document.getElementById('newSectionTitle');
        const inputNewSectionContent = document.getElementById('newSectionContent');

        // Abrir Modal
        btnAddMainSection.onclick = () => {
            inputNewSectionTitle.value = '';
            inputNewSectionContent.value = '';
            modalNuevaSeccion.style.display = 'block';
            inputNewSectionTitle.focus();
        };

        // Cerrar Modal
        closeModalSeccion.onclick = () => {
            modalNuevaSeccion.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target == modalNuevaSeccion) {
                modalNuevaSeccion.style.display = 'none';
            }
            if (event.target == document.getElementById('modalClausula')) {
                document.getElementById('modalClausula').style.display = 'none';
            }
        };

        // Guardar Nueva Sección desde Modal
        btnGuardarNuevaSeccion.onclick = () => {
            const title = inputNewSectionTitle.value.trim();
            const contentText = inputNewSectionContent.value.trim();

            if (!title) {
                alert('Por favor, ingrese un título para la sección.');
                return;
            }

            // Crear Estructura de Acordeón
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item dynamic-main-section';

            // Header
            const header = document.createElement('div');
            header.className = 'accordion-header';

            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.className = 'dynamic-main-section-title';
            titleInput.value = title;
            titleInput.style.background = '#333';
            titleInput.style.border = '1px solid #555';
            titleInput.style.color = '#fff';
            titleInput.style.padding = '5px';
            titleInput.style.fontSize = '1em';
            titleInput.style.fontWeight = 'bold';
            titleInput.style.width = '70%';
            titleInput.onclick = (e) => e.stopPropagation();

            const btnDeleteSection = document.createElement('button');
            btnDeleteSection.textContent = '🗑️';
            btnDeleteSection.title = 'Eliminar Sección';
            btnDeleteSection.type = 'button';
            btnDeleteSection.style.background = 'transparent';
            btnDeleteSection.style.border = 'none';
            btnDeleteSection.style.cursor = 'pointer';
            btnDeleteSection.style.marginLeft = '10px';
            btnDeleteSection.onclick = (e) => {
                e.stopPropagation();
                if (confirm('¿Eliminar esta sección completa?')) {
                    accordionItem.remove();
                    updateLivePreview();
                }
            };

            // Checkbox No Aplica (Para paridad con secciones estándar)
            const noAplicaContainer = document.createElement('div');
            noAplicaContainer.style.display = 'flex';
            noAplicaContainer.style.alignItems = 'center';
            noAplicaContainer.style.marginLeft = '15px';
            noAplicaContainer.onclick = (e) => e.stopPropagation();

            const noAplicaCheck = document.createElement('input');
            noAplicaCheck.type = 'checkbox';
            noAplicaCheck.id = `noAplica_dynamic_${Date.now()}`;
            noAplicaCheck.style.marginRight = '5px';
            noAplicaCheck.onchange = () => updateLivePreview();

            const noAplicaLabel = document.createElement('label');
            noAplicaLabel.htmlFor = noAplicaCheck.id;
            noAplicaLabel.textContent = 'No Aplica';
            noAplicaLabel.style.fontSize = '0.9em';
            noAplicaLabel.style.color = '#ccc';
            noAplicaLabel.style.cursor = 'pointer';

            noAplicaContainer.appendChild(noAplicaCheck);
            noAplicaContainer.appendChild(noAplicaLabel);

            const icon = document.createElement('span');
            icon.className = 'accordion-icon';
            icon.textContent = '▼';

            const headerContent = document.createElement('div');
            headerContent.style.display = 'flex';
            headerContent.style.alignItems = 'center';
            headerContent.style.flex = '1';
            headerContent.appendChild(titleInput);
            headerContent.appendChild(noAplicaContainer);
            headerContent.appendChild(btnDeleteSection);

            header.appendChild(headerContent);
            header.appendChild(icon);

            // Content
            const content = document.createElement('div');
            content.className = 'accordion-content';
            // FORZAR APERTURA INICIAL
            content.style.maxHeight = 'none';
            content.style.opacity = '1';
            content.classList.add('open');
            icon.style.transform = 'rotate(180deg)';

            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'section-content-wrapper';
            contentWrapper.style.padding = '15px 0';

            // Textarea Principal (Pre-llenado)
            const mainContentInput = document.createElement('textarea');
            mainContentInput.className = 'dynamic-main-section-content';
            mainContentInput.rows = 4;
            mainContentInput.value = contentText;
            mainContentInput.placeholder = 'Contenido principal...';
            mainContentInput.style.width = '100%';
            mainContentInput.style.marginBottom = '15px';
            mainContentInput.style.padding = '10px';
            mainContentInput.style.background = '#252525';
            mainContentInput.style.color = '#e0e0e0';
            mainContentInput.style.border = '1px solid #444';
            mainContentInput.style.borderRadius = '4px';

            contentWrapper.appendChild(mainContentInput);

            // --- Lógica Botón "+" Interno ---
            const btnAdd = document.createElement('button');
            btnAdd.className = 'btn-add-floating';
            btnAdd.textContent = '+';
            btnAdd.type = 'button';

            const optionsMenu = document.createElement('div');
            optionsMenu.className = 'add-options-menu';
            optionsMenu.style.display = 'none';
            optionsMenu.style.marginTop = '5px';
            optionsMenu.style.background = '#2d2d2d';
            optionsMenu.style.border = '1px solid #444';
            optionsMenu.style.borderRadius = '4px';
            optionsMenu.style.padding = '5px';
            optionsMenu.style.position = 'absolute';
            optionsMenu.style.zIndex = '100';

            // Opción Subsección
            const btnAddSubsection = document.createElement('button');
            btnAddSubsection.textContent = '📑 Agregar Sub-sección (x.y)';
            btnAddSubsection.type = 'button';
            btnAddSubsection.style.display = 'block';
            btnAddSubsection.style.width = '100%';
            btnAddSubsection.style.textAlign = 'left';
            btnAddSubsection.style.background = 'transparent';
            btnAddSubsection.style.color = '#e0e0e0';
            btnAddSubsection.style.border = 'none';
            btnAddSubsection.style.padding = '8px';
            btnAddSubsection.style.cursor = 'pointer';
            btnAddSubsection.onmouseover = () => btnAddSubsection.style.background = '#444';
            btnAddSubsection.onmouseout = () => btnAddSubsection.style.background = 'transparent';

            btnAddSubsection.onclick = (e) => {
                e.preventDefault(); e.stopPropagation(); optionsMenu.style.display = 'none';
                const subWrapper = document.createElement('div');
                subWrapper.className = 'dynamic-subsection-wrapper';
                subWrapper.style.marginTop = '15px';
                subWrapper.style.borderLeft = '2px solid #4dabf7';
                subWrapper.style.paddingLeft = '10px';

                const subTitleInput = document.createElement('input');
                subTitleInput.type = 'text';
                subTitleInput.className = 'dynamic-subsection-title';
                subTitleInput.placeholder = 'Título Subsección';
                subTitleInput.style.width = '100%';
                subTitleInput.style.marginBottom = '5px';
                subTitleInput.style.background = '#333'; subTitleInput.style.color = '#fff'; subTitleInput.style.border = '1px solid #555';

                const subContentInput = document.createElement('textarea');
                subContentInput.className = 'dynamic-subsection-content';
                subContentInput.rows = 3;
                subContentInput.placeholder = 'Contenido...';
                subContentInput.style.width = '100%';

                const btnRemoveSub = document.createElement('button');
                btnRemoveSub.textContent = 'Eliminar';
                btnRemoveSub.type = 'button';
                btnRemoveSub.style.background = '#ff6b6b'; btnRemoveSub.style.color = 'white'; btnRemoveSub.style.border = 'none'; btnRemoveSub.style.marginTop = '5px';
                btnRemoveSub.onclick = () => { subWrapper.remove(); updateLivePreview(); };

                subWrapper.appendChild(subTitleInput); subWrapper.appendChild(subContentInput); subWrapper.appendChild(btnRemoveSub);
                contentWrapper.insertBefore(subWrapper, btnContainer);
                updateLivePreview();
            };

            // Opción Cláusula
            const btnAddClause = document.createElement('button');
            btnAddClause.textContent = '📝 Agregar Cláusula (Título + Texto)';
            btnAddClause.type = 'button';
            btnAddClause.style.display = 'block';
            btnAddClause.style.width = '100%';
            btnAddClause.style.textAlign = 'left';
            btnAddClause.style.background = 'transparent';
            btnAddClause.style.color = '#e0e0e0';
            btnAddClause.style.border = 'none';
            btnAddClause.style.padding = '8px';
            btnAddClause.style.cursor = 'pointer';
            btnAddClause.onmouseover = () => btnAddClause.style.background = '#444';
            btnAddClause.onmouseout = () => btnAddClause.style.background = 'transparent';

            btnAddClause.onclick = (e) => {
                e.preventDefault(); e.stopPropagation(); optionsMenu.style.display = 'none';
                const clauseWrapper = document.createElement('div');
                clauseWrapper.className = 'dynamic-clause-wrapper';
                clauseWrapper.style.marginTop = '15px';
                clauseWrapper.style.borderLeft = '2px solid #666';
                clauseWrapper.style.paddingLeft = '10px';
                clauseWrapper.style.background = 'rgba(255, 255, 255, 0.05)';
                clauseWrapper.style.padding = '10px';

                const numContainer = document.createElement('div');
                numContainer.style.marginBottom = '5px'; numContainer.style.display = 'flex'; numContainer.style.alignItems = 'center';
                const numCheck = document.createElement('input');
                numCheck.type = 'checkbox'; numCheck.className = 'dynamic-clause-numbered'; numCheck.checked = true; numCheck.id = `chk_${Date.now()}`;
                const numLabel = document.createElement('label');
                numLabel.htmlFor = numCheck.id; numLabel.textContent = 'Numerar (x.y)'; numLabel.style.marginLeft = '5px'; numLabel.style.color = '#ccc';
                numContainer.appendChild(numCheck); numContainer.appendChild(numLabel);

                const clTitleInput = document.createElement('input');
                clTitleInput.type = 'text'; clTitleInput.className = 'dynamic-clause-title'; clTitleInput.placeholder = 'Título Cláusula'; clTitleInput.style.width = '100%'; clTitleInput.style.marginBottom = '5px'; clTitleInput.style.background = '#333'; clTitleInput.style.color = '#fff'; clTitleInput.style.border = '1px solid #555';

                const clContentInput = document.createElement('textarea');
                clContentInput.className = 'dynamic-clause-content'; clContentInput.rows = 3; clContentInput.placeholder = 'Contenido...'; clContentInput.style.width = '100%';

                const btnRemoveCl = document.createElement('button');
                btnRemoveCl.textContent = 'Eliminar';
                btnRemoveCl.type = 'button'; btnRemoveCl.style.background = '#ff6b6b'; btnRemoveCl.style.color = 'white'; btnRemoveCl.style.border = 'none'; btnRemoveCl.style.marginTop = '5px';
                btnRemoveCl.onclick = () => { clauseWrapper.remove(); updateLivePreview(); };

                clauseWrapper.appendChild(numContainer); clauseWrapper.appendChild(clTitleInput); clauseWrapper.appendChild(clContentInput); clauseWrapper.appendChild(btnRemoveCl);
                contentWrapper.insertBefore(clauseWrapper, btnContainer);
                updateLivePreview();
            };

            optionsMenu.appendChild(btnAddSubsection);
            optionsMenu.appendChild(btnAddClause);

            btnAdd.onclick = (e) => { e.stopPropagation(); optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block'; };
            document.addEventListener('click', () => optionsMenu.style.display = 'none');

            const btnContainer = document.createElement('div');
            btnContainer.style.position = 'relative';
            btnContainer.style.marginTop = '15px';
            btnContainer.appendChild(btnAdd);
            btnContainer.appendChild(optionsMenu);
            contentWrapper.appendChild(btnContainer);
            // --- Fin Lógica Botón "+" ---

            content.appendChild(contentWrapper);
            accordionItem.appendChild(header);
            accordionItem.appendChild(content);

            // Lógica Acordeón
            header.addEventListener('click', () => {
                const isOpen = content.classList.contains('open');
                if (isOpen) {
                    content.classList.remove('open');
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    content.classList.add('open');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.opacity = '1';
                    icon.style.transform = 'rotate(180deg)';
                }
            });

            // Insertar antes del botón de agregar sección
            formElement.insertBefore(accordionItem, btnAddMainSection);

            modalNuevaSeccion.style.display = 'none';
            updateLivePreview();
        };

        formElement.appendChild(btnAddMainSection);

        // Inicializar vista previa una vez renderizado todo
        setTimeout(updateLivePreview, 500);

        // Contenedor de botones
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '15px';
        buttonContainer.style.marginTop = '30px';
        buttonContainer.style.justifyContent = 'center';

        // Boton Vista Previa
        const btnVistaPrevia = document.createElement('button');
        btnVistaPrevia.type = 'button';
        btnVistaPrevia.textContent = 'Vista Previa';
        btnVistaPrevia.className = 'btn-vista-previa';
        btnVistaPrevia.style.padding = '12px 30px';
        btnVistaPrevia.style.backgroundColor = '#007bff';
        btnVistaPrevia.style.color = 'white';
        btnVistaPrevia.style.border = 'none';
        btnVistaPrevia.style.borderRadius = '5px';
        btnVistaPrevia.style.cursor = 'pointer';
        btnVistaPrevia.style.fontSize = '16px';

        // Boton Guardar
        const btnGuardar = document.createElement('button');
        btnGuardar.type = 'button';
        btnGuardar.textContent = 'Guardar';
        btnGuardar.className = 'btn-guardar';
        btnGuardar.style.padding = '12px 30px';
        btnGuardar.style.backgroundColor = '#28a745';
        btnGuardar.style.color = 'white';
        btnGuardar.style.border = 'none';
        btnGuardar.style.borderRadius = '5px';
        btnGuardar.style.cursor = 'pointer';
        btnGuardar.style.fontSize = '16px';

        // Boton Revisar IA (deshabilitado por ahora)
        const btnRevisarIA = document.createElement('button');
        btnRevisarIA.type = 'button';
        btnRevisarIA.textContent = 'Revisar con IA';
        btnRevisarIA.className = 'btn-revisar-ia';
        btnRevisarIA.style.padding = '12px 30px';
        btnRevisarIA.style.backgroundColor = '#6c757d';
        btnRevisarIA.style.color = 'white';
        btnRevisarIA.style.border = 'none';
        btnRevisarIA.style.borderRadius = '5px';
        btnRevisarIA.style.cursor = 'not-allowed';
        btnRevisarIA.style.fontSize = '16px';
        btnRevisarIA.style.opacity = '0.6';
        btnRevisarIA.disabled = true;
        btnRevisarIA.title = 'Funcionalidad disponible proximamente (requiere API)';

        buttonContainer.appendChild(btnVistaPrevia);
        buttonContainer.appendChild(btnGuardar);
        buttonContainer.appendChild(btnRevisarIA);
        formElement.appendChild(buttonContainer);

        // Función para validar campos obligatorios
        function validarCamposObligatorios() {
            const camposRequeridos = formElement.querySelectorAll('[data-required="true"]');
            const errores = [];

            camposRequeridos.forEach(campo => {
                const label = formElement.querySelector(`label[for="${campo.id}"]`);
                const nombreCampo = label ? label.textContent.replace(' *', '').trim() : campo.id;

                // Validar según tipo de campo
                if (campo.tagName === 'SELECT') {
                    if (!campo.value || campo.value === '') {
                        errores.push(nombreCampo);
                    }
                } else if (campo.tagName === 'INPUT' || campo.tagName === 'TEXTAREA') {
                    const valor = campo.value.trim();
                    if (!valor || valor === '') {
                        errores.push(nombreCampo);
                    }
                }
            });

            return errores;
        }

        // Función para mostrar errores de validación
        function mostrarErroresValidacion(camposFaltantes) {
            // Eliminar mensaje de error anterior si existe
            const errorAnterior = document.querySelector('.validation-error-box');
            if (errorAnterior) {
                errorAnterior.remove();
            }

            // Crear caja de error
            const errorBox = document.createElement('div');
            errorBox.className = 'validation-error-box';
            errorBox.innerHTML = `
                <h3>⚠️ No se puede guardar el TDR</h3>
                <p><strong>Los siguientes campos obligatorios están vacíos:</strong></p>
                <ul>
                    ${camposFaltantes.map(campo => `<li>${campo}</li>`).join('')}
                </ul>
                <button class="validation-error-close">Entendido</button>
            `;

            // Insertar al inicio del formulario
            formElement.insertBefore(errorBox, formElement.firstChild);

            // Scroll hacia el error
            errorBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Botón para cerrar el error
            errorBox.querySelector('.validation-error-close').addEventListener('click', () => {
                errorBox.remove();
            });

            // Enfocar el primer campo vacío
            const primerCampoId = formElement.querySelector('[data-required="true"]');
            if (primerCampoId) {
                const camposRequeridos = formElement.querySelectorAll('[data-required="true"]');
                for (const campo of camposRequeridos) {
                    const valor = campo.tagName === 'SELECT' ? campo.value : campo.value.trim();
                    if (!valor || valor === '') {
                        campo.focus();
                        campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        break;
                    }
                }
            }
        }

        // Funcion para recolectar datos del formulario ESTRUCTURADOS para la vista previa
        // ==========================================
        // LÓGICA DE VISTA PREVIA EN VIVO (DOM-FIRST STRATEGY MEJORADA)
        // ==========================================
        // ==========================================
        // LÓGICA DE VISTA PREVIA EN VIVO (DOM-FIRST STRATEGY MEJORADA)
        // ==========================================
        function updateLivePreview() {
            try {
                const previewContainer = document.getElementById('doc-body');
                if (!previewContainer) return;

                let htmlContent = '';

                // 1. Datos Generales
                const datosGeneralesSection = document.getElementById('accordion-general_data') || document.getElementById('accordion-datos_generales');
                if (datosGeneralesSection) {
                    const getVal = (name) => datosGeneralesSection.querySelector(`[name="${name}"]`)?.value || 'No especificado';
                    const getSelectText = (name) => {
                        const sel = datosGeneralesSection.querySelector(`[name="${name}"]`);
                        return sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text : 'No especificado';
                    };

                    const actividadSelect = datosGeneralesSection.querySelector('[name="actividadPOI"]');
                    const actividad = actividadSelect ? Array.from(actividadSelect.selectedOptions).map(o => o.text).join(', ') : 'No especificado';

                    htmlContent += `
                        <table class="doc-table">
                            <tr><td>Item:</td><td>${getVal('item')}</td></tr>
                            <tr><td>Meta Presupuestaria:</td><td>${getSelectText('metaPresupuestaria')}</td></tr>
                            <tr><td>Unidad de Organización:</td><td>${getVal('unidadOrganizacion')}</td></tr>
                            <tr><td>Actividad del POI:</td><td>${actividad}</td></tr>
                            <tr><td>Denominación de la Contratación:</td><td>${getVal('denominacionContratacion')}</td></tr>
                        </table>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    `;
                }

                // 2. Iterar sobre items del acordeón
                const accordionItems = document.querySelectorAll('.accordion-item');
                let sectionCounter = 1;

                accordionItems.forEach(item => {
                    if (item.id === 'accordion-general_data' || item.id === 'accordion-datos_generales') return;

                    const noAplica = item.querySelector('input[type="checkbox"][id^="noAplica"]');
                    if (noAplica && noAplica.checked) return;

                    // Título Principal
                    const headerH3 = item.querySelector('.accordion-header h3');
                    const headerInput = item.querySelector('.dynamic-main-section-title');

                    let rawTitle = 'Sección';
                    if (headerH3) {
                        rawTitle = headerH3.textContent.trim();
                    } else if (headerInput) {
                        rawTitle = headerInput.value.trim() || 'Nueva Sección';
                    }

                    const cleanTitle = rawTitle.replace(/^\d+(\.\d+)*\s*/, '');

                    htmlContent += `<div class="doc-section">`;
                    htmlContent += `<div class="doc-section-title">${sectionCounter}. ${cleanTitle}</div>`;

                    const contentWrapper = item.querySelector('.section-content-wrapper') || item.querySelector('.accordion-content');

                    let hasMainContent = false;
                    if (contentWrapper) {
                        // 1. Contenido Principal de la Sección (Intro)
                        const mainContentInput = contentWrapper.querySelector('.dynamic-main-section-content');
                        if (mainContentInput && mainContentInput.value.trim()) {
                            htmlContent += `<div class="doc-section-content"><p>${mainContentInput.value.trim()}</p></div>`;
                            hasMainContent = true;
                        }
                        // Detectar si hay subsecciones (H4 estáticos o Inputs dinámicos de título)
                        const staticSubTitles = contentWrapper.querySelectorAll('h4');
                        const dynamicSubTitles = contentWrapper.querySelectorAll('.dynamic-subsection-title');
                        const hasSubsections = staticSubTitles.length > 0 || dynamicSubTitles.length > 0;

                        if (hasSubsections) {
                            // Lógica para Subsecciones
                            let subCounter = 1;
                            let currentSubContent = '';

                            // Función para volcar contenido acumulado
                            const flushContent = () => {
                                if (currentSubContent) {
                                    htmlContent += `<div class="doc-section-content">${currentSubContent}</div>`;
                                    currentSubContent = '';
                                }
                            };

                            // Iterar hijos para agrupar contenido
                            Array.from(contentWrapper.children).forEach(child => {
                                if (child.classList.contains('dynamic-main-section-content')) return;

                                // Identificar tipos de bloques
                                const isStaticTitle = child.tagName === 'H4';
                                const isDynamicSubWrapper = child.classList.contains('dynamic-subsection-wrapper');
                                const isDynamicClauseWrapper = child.classList.contains('dynamic-clause-wrapper');

                                if (isStaticTitle) {
                                    flushContent();
                                    const subCleanTitle = child.textContent.trim().replace(/^\d+(\.\d+)*\s*/, '');
                                    htmlContent += `<div class="doc-subsection-title" style="margin-top:10px; margin-left:15px;">${sectionCounter}.${subCounter}. ${subCleanTitle}</div>`;
                                    subCounter++;
                                } else if (isDynamicSubWrapper) {
                                    flushContent();
                                    const inputTitle = child.querySelector('.dynamic-subsection-title');
                                    const val = inputTitle ? inputTitle.value.trim() : 'Subsección';
                                    if (val) {
                                        htmlContent += `<div class="doc-subsection-title" style="margin-top:10px; margin-left:15px;">${sectionCounter}.${subCounter}. ${val}</div>`;
                                        subCounter++;
                                    }
                                    const contentInput = child.querySelector('.dynamic-subsection-content');
                                    if (contentInput && contentInput.value.trim()) {
                                        htmlContent += `<div class="doc-section-content" style="margin-left:15px;"><p>${contentInput.value.trim()}</p></div>`;
                                    }
                                } else if (isDynamicClauseWrapper) {
                                    // Cláusula Personalizada (Puede ser numerada o simple)
                                    const inputTitle = child.querySelector('.dynamic-clause-title');
                                    const inputContent = child.querySelector('.dynamic-clause-content');
                                    const isNumbered = child.querySelector('.dynamic-clause-numbered')?.checked;

                                    if (isNumbered) {
                                        // Renderizar como Subsección Numerada (x.y)
                                        flushContent(); // Cerrar contenido anterior

                                        const val = inputTitle ? inputTitle.value.trim() : 'Cláusula';
                                        if (val) {
                                            htmlContent += `<div class="doc-subsection-title" style="margin-top:10px; margin-left:15px;">${sectionCounter}.${subCounter}. ${val}</div>`;
                                            subCounter++;
                                        }

                                        if (inputContent && inputContent.value.trim()) {
                                            htmlContent += `<div class="doc-section-content" style="margin-left:15px;"><p>${inputContent.value.trim()}</p></div>`;
                                        }
                                    } else {
                                        // Renderizar como Bloque de Texto con Título (Sin numeración x.y)
                                        let clauseHtml = '';
                                        if (inputTitle && inputTitle.value.trim()) {
                                            clauseHtml += `<strong>${inputTitle.value.trim()}</strong><br>`;
                                        }
                                        if (inputContent && inputContent.value.trim()) {
                                            clauseHtml += `${inputContent.value.trim()}`;
                                        }

                                        if (clauseHtml) {
                                            // Indentar si estamos dentro de una subsección
                                            const style = subCounter > 1 ? 'margin-left:15px;' : '';
                                            // Agregamos al contenido acumulado
                                            if (currentSubContent) currentSubContent += '<br><br>';
                                            currentSubContent += `<p style="${style}">${clauseHtml}</p>`;
                                        }
                                    }

                                } else {
                                    // Contenido normal (párrafos sueltos, inputs adicionales fuera de wrappers)
                                    // OJO: Si es un botón o el menú de agregar, ignorar
                                    if (child.tagName === 'BUTTON' || child.classList.contains('add-options-menu')) return;

                                    const extractedText = extractContentFromNode(child);
                                    if (extractedText) {
                                        // Acumular en currentSubContent para mantener orden relativo a subsecciones
                                        if (currentSubContent) currentSubContent += '<br>';
                                        currentSubContent += extractedText;
                                    }
                                }
                            });
                            flushContent();
                        } else {
                            // Lógica Plana (Sin subsecciones)
                            // Aquí también debemos soportar las cláusulas dinámicas si se agregan
                            let flatContent = '';
                            Array.from(contentWrapper.children).forEach(child => {
                                if (child.classList.contains('dynamic-main-section-content')) return;

                                if (child.classList.contains('dynamic-clause-wrapper')) {
                                    const inputTitle = child.querySelector('.dynamic-clause-title');
                                    const inputContent = child.querySelector('.dynamic-clause-content');
                                    if (inputTitle && inputTitle.value.trim()) flatContent += `<p><strong>${inputTitle.value.trim()}</strong></p>`;
                                    if (inputContent && inputContent.value.trim()) flatContent += `<p>${inputContent.value.trim()}</p>`;
                                } else {
                                    if (child.tagName === 'BUTTON' || child.classList.contains('add-options-menu')) return;
                                    flatContent += extractContentFromNode(child);
                                }
                            });

                            if (flatContent) {
                                htmlContent += `<div class="doc-section-content">${flatContent}</div>`;
                            } else if (!hasMainContent) {
                                htmlContent += `<div class="doc-section-content"><p style="color:#ccc; font-style:italic;">(Sin contenido)</p></div>`;
                            }
                        }
                    }

                    htmlContent += `</div>`; // Cerrar doc-section
                    sectionCounter++;
                });

                previewContainer.innerHTML = htmlContent;

            } catch (e) {
                console.error("Error en Live Preview:", e);
            }
        }

        // Helper para extraer texto de nodos (divs, inputs, etc)
        function extractContentFromNode(node) {
            let textParts = [];

            // Si es un nodo de texto directo (raro en este layout)
            if (node.nodeType === 3 && node.textContent.trim()) return `<p>${node.textContent.trim()}</p>`;

            // Buscar inputs/textareas dentro del nodo
            const inputs = node.querySelectorAll ? node.querySelectorAll('input[type="text"], textarea') : [];
            inputs.forEach(input => {
                if (input.type === 'text' || input.tagName === 'TEXTAREA') {
                    // Ignorar inputs ocultos de "otros" si no están activos
                    if (input.parentElement.style.display === 'none') return;
                    if (input.value.trim()) textParts.push(`<p>${input.value.trim()}</p>`);
                }
            });

            // Buscar Radios seleccionados
            const radios = node.querySelectorAll ? node.querySelectorAll('input[type="radio"]:checked') : [];
            radios.forEach(radio => {
                if (radio.name === 'contractType') return;
                const label = radio.nextElementSibling;
                if (label) {
                    let txt = label.textContent.trim();
                    // Si es "Otros", no agregamos el texto del radio, esperamos que el input de texto lo cubra
                    if (!txt.toLowerCase().includes('otros') && !txt.toLowerCase().includes('especifique')) {
                        textParts.push(`<p>${txt}</p>`);
                    }
                }
            });

            // Si el propio nodo es un input/textarea (caso borde)
            if (node.tagName === 'TEXTAREA' || (node.tagName === 'INPUT' && node.type === 'text')) {
                if (node.value.trim()) textParts.push(`<p>${node.value.trim()}</p>`);
            }

            return textParts.join('');
        }

        // Event Listeners Globales para Live Preview
        // Usamos 'input' y 'change' en todo el documento para capturar cualquier cambio
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) updateLivePreview();
        });
        document.addEventListener('change', (e) => {
            if (e.target.matches('input, textarea, select')) updateLivePreview();
        });

        // Inicializar Preview periódicamente para asegurar sincronización
        setInterval(updateLivePreview, 2000); // Polling cada 2s como respaldo
        setTimeout(updateLivePreview, 1000); // Primera carga
        // (Función collectFormData eliminada en favor de DOM-First Strategy)

        // Event listener Vista Previa
        btnVistaPrevia.addEventListener('click', (event) => {
            event.preventDefault();
            const formData = collectFormData();

            // Guardar en sessionStorage para no perder datos
            sessionStorage.setItem('tdr_datos_temporales', JSON.stringify(formData));

            // Navegar a vista previa
            window.location.href = 'vista_previa.html';
        });

        // Event listener Guardar
        btnGuardar.addEventListener('click', (event) => {
            event.preventDefault();

            // VALIDAR CAMPOS OBLIGATORIOS PRIMERO
            const camposFaltantes = validarCamposObligatorios();

            if (camposFaltantes.length > 0) {
                mostrarErroresValidacion(camposFaltantes);
                return; // Detener el guardado
            }

            // Si pasa la validación, continuar con el guardado
            const formData = collectFormData();

            // Generar ID unico
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const tdrId = `TDR_${timestamp}`;

            // Estructura completa del TDR
            const tdrCompleto = {
                id: tdrId,
                fecha_creacion: new Date().toISOString(),
                tipo: 'Servicio',
                monto_estimado: formData.estimatedAmount || 0,
                meta: formData.metaPresupuestaria || '',
                unidad: formData.unidadOrganizacion || '',
                actividades: formData.actividadPOI || [],
                denominacion: formData.denominacionContratacion || '',
                secciones: formData,
                estado: 'borrador',
                ultima_modificacion: new Date().toISOString()
            };

            // Descargar como JSON
            const dataStr = JSON.stringify(tdrCompleto, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${tdrId}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`TDR guardado exitosamente como ${tdrId}.json`);
        });

        // Event listener Revisar IA (placeholder)
        btnRevisarIA.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Esta funcionalidad estara disponible cuando se configure la API de Claude.');
        });

        // --- Manejador del Modal de Cláusulas Personalizadas ---
        const modal = document.getElementById('modalClausula');
        const closeBtn = modal.querySelector('.close');
        const btnGuardarClausula = document.getElementById('btnGuardarClausula');
        const clausulaTituloInput = document.getElementById('clausulaTitulo');
        const clausulaContenidoInput = document.getElementById('clausulaContenido');
        let insertBeforeId = null;

        // Event listeners para botones "+"
        document.querySelectorAll('.btn-add-clause').forEach(btn => {
            btn.addEventListener('click', function () {
                insertBeforeId = this.getAttribute('data-insert-before');
                modal.style.display = 'flex';
                clausulaTituloInput.value = '';
                clausulaContenidoInput.value = '';
            });
        });

        // Cerrar modal
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // ==========================================
        // TOGGLE VISTA PREVIA (DESPEGABLE)
        // ==========================================
        const btnTogglePreview = document.getElementById('btnTogglePreview');
        const previewPane = document.getElementById('preview-pane');
        let isPreviewOpen = true; // Empezar abierto por defecto

        function togglePreview() {
            isPreviewOpen = !isPreviewOpen;
            if (isPreviewOpen) {
                previewPane.classList.add('open');
                btnTogglePreview.innerHTML = '👁️ Ocultar Vista Previa';
                btnTogglePreview.style.backgroundColor = '#4dabf7';
                btnTogglePreview.style.color = 'white';
            } else {
                previewPane.classList.remove('open');
                btnTogglePreview.innerHTML = '👁️ Ver Hoja / Vista Previa';
                btnTogglePreview.style.backgroundColor = '#2d2d2d';
                btnTogglePreview.style.color = '#4dabf7';
            }
        }

        if (btnTogglePreview && previewPane) {
            btnTogglePreview.addEventListener('click', (e) => {
                e.preventDefault();
                togglePreview();
            });

            // Estado inicial: Abierto
            previewPane.classList.add('open');
            btnTogglePreview.innerHTML = '👁️ Ocultar Vista Previa';
            btnTogglePreview.style.backgroundColor = '#4dabf7';
            btnTogglePreview.style.color = 'white';
        }

        // Guardar cláusula personalizada (Lógica corregida y restaurada)
        btnGuardarClausula.addEventListener('click', () => {
            const titulo = clausulaTituloInput.value.trim();
            const contenido = clausulaContenidoInput.value.trim();
            const insertBeforeId = clausulaPosicionSelect.value;

            if (!titulo || !contenido) {
                alert('Por favor complete el título y contenido de la cláusula');
                return;
            }

            // Generar ID único para la cláusula
            const clausulaId = `custom_${Date.now()}`;

            // Crear item de acordeón para la cláusula custom
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item active';
            accordionItem.id = `accordion-${clausulaId}`;

            // Header
            const accordionHeader = document.createElement('div');
            accordionHeader.className = 'accordion-header';
            accordionHeader.innerHTML = `<h3>${titulo} (Personalizado)</h3>`;
            accordionHeader.onclick = () => {
                accordionItem.classList.toggle('active');
            };

            // Content
            const accordionContent = document.createElement('div');
            accordionContent.className = 'accordion-content';

            const textarea = document.createElement('textarea');
            textarea.id = `content_${clausulaId}`;
            textarea.value = contenido;
            textarea.rows = 4;

            // Botón eliminar
            const btnDelete = document.createElement('button');
            btnDelete.textContent = 'Eliminar Sección';
            btnDelete.style.background = '#ff6b6b';
            btnDelete.style.color = 'white';
            btnDelete.style.border = 'none';
            btnDelete.style.marginTop = '10px';
            btnDelete.style.padding = '5px 10px';
            btnDelete.style.cursor = 'pointer';
            btnDelete.onclick = () => {
                accordionItem.remove();
                updateLivePreview();
            };

            accordionContent.appendChild(textarea);
            accordionContent.appendChild(btnDelete);
            accordionItem.appendChild(accordionHeader);
            accordionItem.appendChild(accordionContent);

            // Insertar en el DOM
            const targetAccordion = document.getElementById(`accordion-${insertBeforeId}`);
            if (targetAccordion) {
                formElement.insertBefore(accordionItem, targetAccordion);
            } else {
                formElement.appendChild(accordionItem);
            }

            // Cerrar modal y limpiar
            modal.style.display = 'none';
            clausulaTituloInput.value = '';
            clausulaContenidoInput.value = '';

            updateLivePreview();
        });

        console.log('Formulario interactivo generado con todos los controles.');
    }

    // Funcion para restaurar formulario con datos previos
    async function restaurarFormularioConDatos(datosGuardados) {
        // Ocultar formulario inicial
        conditionsFormContainer.style.display = 'none';

        // Cargar la plantilla
        const templatePath = 'data/TDR_Servicios_Generales.md';
        const parsedTemplateSections = await loadAndParseTemplate(templatePath);

        if (parsedTemplateSections.length > 0) {
            await renderInteractiveForm(parsedTemplateSections);

            // Restaurar valores de todos los campos
            setTimeout(() => {
                const form = document.getElementById('tdaInteractiveForm');
                if (form) {
                    Object.keys(datosGuardados).forEach(fieldName => {
                        const element = form.elements[fieldName];
                        if (element) {
                            const value = datosGuardados[fieldName];

                            if (element.type === 'radio') {
                                const radioButton = form.querySelector(`input[name="${fieldName}"][value="${value}"]`);
                                if (radioButton) radioButton.checked = true;
                            } else if (element.type === 'checkbox') {
                                element.checked = value;
                            } else if (element.tagName === 'SELECT' && element.multiple) {
                                Array.from(element.options).forEach(option => {
                                    if (Array.isArray(value) && value.includes(option.value)) {
                                        option.selected = true;
                                    }
                                });
                            } else {
                                element.value = value;
                            }
                        }
                    });

                    console.log('Formulario restaurado con datos previos');
                }
            }, 500);
        }
    }

    conditionsForm.addEventListener('submit', async (event) => { // Mark as async
        event.preventDefault();

        validationMessages.textContent = '';

        const contractType = conditionsForm.elements.contractType.value;
        const estimatedAmount = parseFloat(conditionsForm.elements.estimatedAmount.value);

        if (!contractType) {
            validationMessages.textContent = 'Por favor, seleccione un Tipo de Contratación (Bien o Servicio).';
            return;
        }

        if (isNaN(estimatedAmount) || estimatedAmount <= 0) {
            validationMessages.textContent = 'Por favor, ingrese un Monto Estimado válido y mayor que cero.';
            return;
        }

        let selectedTemplatePath = '';
        const baseTemplateName = 'data/TDR_Servicios_Generales.md'; // Nuevo markdown limpio
        const TDR_UMBRAL = UIT_ACTUAL_VALUE * 8; // Umbral para TDR de servicios (8 UIT)

        if (contractType === 'Servicio' && estimatedAmount <= TDR_UMBRAL) {
            selectedTemplatePath = baseTemplateName;
        } else {
            validationMessages.textContent = 'Actualmente solo se soporta la plantilla de TDR para Servicios > 8 UIT.';
            console.log(`Tipo: ${contractType}, Monto: ${estimatedAmount}. No se cargará la plantilla PS 04.01.01 FORM 01.`);
            return;
        }

        conditionsFormContainer.innerHTML = `
            <h2>Cargando Formulario de Términos de Referencia</h2>
            <p>Plantilla a cargar: <strong>${selectedTemplatePath}</strong></p>
            <p>Procesando plantilla y preparando campos interactivos...</p>
        `;

        const parsedTemplateSections = await loadAndParseTemplate(selectedTemplatePath);

        if (parsedTemplateSections.length > 0) {
            console.log('Plantilla parseada exitosamente:', parsedTemplateSections);
            // Display parsed sections on the page for debugging
            const debugOutput = document.createElement('pre');
            debugOutput.style.backgroundColor = '#f0f0f0';
            debugOutput.style.border = '1px solid #ccc';
            debugOutput.style.padding = '10px';
            debugOutput.style.marginTop = '20px';
            debugOutput.textContent = JSON.stringify(parsedTemplateSections, null, 2);
            appContainer.appendChild(debugOutput);
            // End Debug output

            await renderInteractiveForm(parsedTemplateSections);
        } else {
            appContainer.innerHTML = `<p class="error-message">No se pudo procesar la plantilla.</p>`;
        }
    });

    // Fetch metas data early if needed, or just before rendering form
    // fetchMetasData(); // This could pre-load the data
});
