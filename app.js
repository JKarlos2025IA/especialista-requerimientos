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
            title.textContent = section.title.replace(/^\d+(\.\d+)*\.?\s*/, '');

            // Span para la numeración dinámica en el formulario
            const numberSpan = document.createElement('span');
            numberSpan.className = 'section-number';
            numberSpan.style.color = '#4dabf7';
            numberSpan.style.marginRight = '10px';
            numberSpan.style.fontWeight = 'bold';

            accordionHeader.appendChild(btnHeaderAdd); // Insertar botón + antes del título
            accordionHeader.appendChild(numberSpan);   // Insertar número
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
                // Solo actualizamos la vista previa.
                // Ya no deshabilitamos los inputs para permitir que el usuario edite si decide volver a incluirla
                // o si quiere dejar "NO APLICA" escrito explícitamente (en cuyo caso no debería marcar este check).
                if (e.target.checked) {
                    accordionItem.style.opacity = '0.5'; // Visual feedback only
                } else {
                    accordionItem.style.opacity = '1';
                }
                updateLivePreview();
            });
            const noAplicaLabel = document.createElement('label');
            noAplicaLabel.htmlFor = `noAplica_${section.id}`;
            noAplicaLabel.textContent = 'Excluir del documento final';
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
            // Dynamically add controls based on section content and title
            // FIX: Asegurar que la primera sección (Datos Generales) siempre esté abierta
            if (index === 0 || section.id === 'general_data' || section.id === 'datos_generales') {
                // ... (Lógica existente para Datos Generales) ...
                if (section.id === 'general_data' || section.id === 'datos_generales') {
                    // Solo agregar los inputs específicos si es realmente Datos Generales
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
                }

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
                // FIX: Si es una sección dinámica (o tiene contenido explícito), debemos renderizar su input de contenido principal
                // ANTES de renderizar las subsecciones. De lo contrario, al agregar una subsección, el contenido principal desaparece.
                if (section.isDynamic || (section.content && section.content.trim() !== '')) {
                    const contentInput = document.createElement('textarea');
                    // Usamos la clase que syncFormStateToData busca primero
                    contentInput.className = 'dynamic-main-section-content';
                    contentInput.value = section.content || '';
                    contentInput.rows = 3;
                    contentInput.placeholder = 'Contenido de la sección...';
                    contentInput.style.width = '100%';
                    contentInput.style.marginBottom = '15px';

                    // Si es estática, tal vez queramos usar el ID estándar para consistencia, 
                    // pero dynamic-main-section-content es más seguro para nuestra lógica de sync nueva.
                    if (!section.isDynamic) {
                        contentInput.id = `content_${section.id}`;
                    }

                    sectionDiv.appendChild(contentInput);
                }

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

                // --- RENDERIZAR SUBSECCIONES DINÁMICAS AGREGADAS A ESTA SECCIÓN ESTÁTICA ---
                if (section.dynamicSubsections && section.dynamicSubsections.length > 0) {
                    section.dynamicSubsections.forEach(sub => {
                        const subWrapper = document.createElement('div');
                        subWrapper.className = 'dynamic-subsection-wrapper';
                        subWrapper.style.marginTop = '15px';
                        subWrapper.style.borderLeft = '2px solid #4dabf7';
                        subWrapper.style.paddingLeft = '10px';

                        // Span para numeración de subsección
                        const subNumberSpan = document.createElement('span');
                        subNumberSpan.className = 'subsection-number';
                        subNumberSpan.style.color = '#4dabf7';
                        subNumberSpan.style.marginRight = '10px';
                        subNumberSpan.style.fontWeight = 'bold';

                        const subTitleInput = document.createElement('input');
                        subTitleInput.type = 'text';
                        subTitleInput.className = 'dynamic-subsection-title';
                        subTitleInput.value = sub.title;
                        subTitleInput.placeholder = 'Título Subsección';
                        subTitleInput.style.width = 'calc(100% - 40px)'; // Ajustar ancho
                        subTitleInput.style.marginBottom = '5px';
                        subTitleInput.style.background = '#333'; subTitleInput.style.color = '#fff'; subTitleInput.style.border = '1px solid #555';

                        const subContentInput = document.createElement('textarea');
                        subContentInput.className = 'dynamic-subsection-content';
                        subContentInput.value = sub.content;
                        subContentInput.rows = 3;
                        subContentInput.placeholder = 'Contenido...';
                        subContentInput.style.width = '100%';

                        const btnRemoveSub = document.createElement('button');
                        btnRemoveSub.textContent = 'Eliminar';
                        btnRemoveSub.type = 'button';
                        btnRemoveSub.style.background = '#ff6b6b'; btnRemoveSub.style.color = 'white'; btnRemoveSub.style.border = 'none'; btnRemoveSub.style.marginTop = '5px';
                        btnRemoveSub.onclick = () => { subWrapper.remove(); updateLivePreview(); };

                        subWrapper.appendChild(subNumberSpan); // Agregar número
                        subWrapper.appendChild(subTitleInput); subWrapper.appendChild(subContentInput); subWrapper.appendChild(btnRemoveSub);
                        sectionDiv.appendChild(subWrapper);
                    });
                }
                // ---------------------------------------------------------------------------

            } else if (section.title.includes('Resultados Esperados-Entregables')) {
                // SECCIÓN DE ENTREGABLES
                const options = [
                    { value: 'unico', text: 'Único entregable' },
                    { value: 'dos', text: 'Dos entregables' },
                    { value: 'tres', text: 'Tres entregables' },
                    { value: 'otros', text: 'Otros (Personalizado)' }
                ];

                const selectGroup = document.createElement('div');
                selectGroup.style.marginBottom = '15px';
                const label = document.createElement('label');
                label.textContent = 'Cantidad de Entregables:';
                label.style.display = 'block'; label.style.marginBottom = '5px'; label.style.color = '#ccc';
                const select = document.createElement('select');
                select.className = 'form-select';
                select.style.width = '100%'; select.style.padding = '8px'; select.style.background = '#333'; select.style.color = '#fff'; select.style.border = '1px solid #555'; select.style.borderRadius = '4px';

                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.text;
                    select.appendChild(option);
                });

                // Restaurar selección previa si existe (guardada en section.deliverablesType por ejemplo)
                select.value = section.deliverablesType || 'unico';

                selectGroup.appendChild(label);
                selectGroup.appendChild(select);
                sectionDiv.appendChild(selectGroup);

                const deliverablesContainer = document.createElement('div');
                deliverablesContainer.className = 'deliverables-container';
                sectionDiv.appendChild(deliverablesContainer);

                const renderDeliverableRow = (index, defaultTitle = '', defaultDesc = '', defaultDeadline = '') => {
                    const row = document.createElement('div');
                    row.className = 'deliverable-input-group';
                    row.innerHTML = `
                        <label>Entregable ${index + 1}:</label>
                        <input type="text" class="del-title" value="${defaultTitle}" placeholder="Nombre del entregable (Ej: Primer entregable)">
                        <label>Descripción:</label>
                        <textarea class="del-desc" rows="2" placeholder="Descripción del entregable">${defaultDesc}</textarea>
                        <label>Plazo:</label>
                        <input type="text" class="del-deadline" value="${defaultDeadline}" placeholder="Plazo (Ej: Hasta los 30 días...)">
                        <button type="button" class="btn-remove-deliverable" style="display: none;">Eliminar</button>
                    `;

                    // Event listeners para actualizar preview
                    row.querySelectorAll('input, textarea').forEach(input => {
                        input.addEventListener('input', updateLivePreview);
                    });

                    // Botón eliminar (solo visible en modo 'otros')
                    row.querySelector('.btn-remove-deliverable').onclick = () => {
                        row.remove();
                        updateLivePreview();
                    };

                    return row;
                };

                const updateDeliverablesUI = () => {
                    deliverablesContainer.innerHTML = '';
                    const type = select.value;

                    let rowsData = [];
                    const defaultDesc = 'Informe sobre las actividades realizadas';

                    if (section.deliverables && section.deliverablesType === type && section.deliverables.length > 0) {
                        rowsData = section.deliverables;
                    } else if (type === 'unico') {
                        rowsData.push({ title: 'Único entregable', desc: defaultDesc, deadline: 'Hasta los 30 días calendario del inicio del servicio' });
                    } else if (type === 'dos') {
                        rowsData.push({ title: 'Primer entregable', desc: defaultDesc, deadline: 'Hasta los 30 días calendario del inicio del servicio' });
                        rowsData.push({ title: 'Segundo entregable', desc: defaultDesc, deadline: 'Hasta los 60 días calendario del inicio del servicio' });
                    } else if (type === 'tres') {
                        rowsData.push({ title: 'Primer entregable', desc: defaultDesc, deadline: 'Hasta los 30 días calendario del inicio del servicio' });
                        rowsData.push({ title: 'Segundo entregable', desc: defaultDesc, deadline: 'Hasta los 60 días calendario del inicio del servicio' });
                        rowsData.push({ title: 'Tercer entregable', desc: defaultDesc, deadline: 'Hasta los 90 días calendario del inicio del servicio' });
                    } else if (type === 'otros') {
                        // En 'otros', permitimos agregar manualmente. Iniciamos con 1 vacío.
                        rowsData.push({ title: '', desc: '', deadline: '' });
                    }

                    section.deliverablesType = type;

                    rowsData.forEach((data, idx) => {
                        const row = renderDeliverableRow(idx, data.title, data.desc, data.deadline);
                        if (type === 'otros') {
                            row.querySelector('.btn-remove-deliverable').style.display = 'block';
                        }
                        deliverablesContainer.appendChild(row);
                    });

                    if (type === 'otros') {
                        const btnAdd = document.createElement('button');
                        btnAdd.className = 'btn-add-deliverable';
                        btnAdd.textContent = '+ Agregar Entregable';
                        btnAdd.onclick = () => {
                            const newRow = renderDeliverableRow(deliverablesContainer.querySelectorAll('.deliverable-input-group').length);
                            newRow.querySelector('.btn-remove-deliverable').style.display = 'block';
                            deliverablesContainer.insertBefore(newRow, btnAdd);
                            updateLivePreview();
                        };
                        deliverablesContainer.appendChild(btnAdd);
                    }
                    updateLivePreview();
                };

                select.addEventListener('change', updateDeliverablesUI);
                // Inicializar (usando setTimeout para asegurar que el DOM esté listo si es necesario, aunque aquí es síncrono)
                updateDeliverablesUI();

            } else {
                // Fallback normal
                sectionDiv.appendChild(createTextInput(`content_${section.id}`, 'Contenido:', section.content, true));

                // --- RENDERIZAR SUBSECCIONES DINÁMICAS (FALLBACK) ---
                if (section.dynamicSubsections && section.dynamicSubsections.length > 0) {
                    section.dynamicSubsections.forEach(sub => {
                        const subWrapper = document.createElement('div');
                        subWrapper.className = 'dynamic-subsection-wrapper';
                        subWrapper.style.marginTop = '15px';
                        subWrapper.style.borderLeft = '2px solid #4dabf7';
                        subWrapper.style.paddingLeft = '10px';

                        // Span para numeración de subsección
                        const subNumberSpan = document.createElement('span');
                        subNumberSpan.className = 'subsection-number';
                        subNumberSpan.style.color = '#4dabf7';
                        subNumberSpan.style.marginRight = '10px';
                        subNumberSpan.style.fontWeight = 'bold';

                        const subTitleInput = document.createElement('input');
                        subTitleInput.type = 'text';
                        subTitleInput.className = 'dynamic-subsection-title';
                        subTitleInput.value = sub.title;
                        subTitleInput.placeholder = 'Título Subsección';
                        subTitleInput.style.width = 'calc(100% - 40px)'; // Ajustar ancho
                        subTitleInput.style.marginBottom = '5px';
                        subTitleInput.style.background = '#333'; subTitleInput.style.color = '#fff'; subTitleInput.style.border = '1px solid #555';

                        const subContentInput = document.createElement('textarea');
                        subContentInput.className = 'dynamic-subsection-content';
                        subContentInput.value = sub.content;
                        subContentInput.rows = 3;
                        subContentInput.placeholder = 'Contenido...';
                        subContentInput.style.width = '100%';

                        const btnRemoveSub = document.createElement('button');
                        btnRemoveSub.textContent = 'Eliminar';
                        btnRemoveSub.type = 'button';
                        btnRemoveSub.style.background = '#ff6b6b'; btnRemoveSub.style.color = 'white'; btnRemoveSub.style.border = 'none'; btnRemoveSub.style.marginTop = '5px';
                        btnRemoveSub.onclick = () => { subWrapper.remove(); updateLivePreview(); };

                        subWrapper.appendChild(subNumberSpan); // Agregar número
                        subWrapper.appendChild(subTitleInput); subWrapper.appendChild(subContentInput); subWrapper.appendChild(btnRemoveSub);
                        sectionDiv.appendChild(subWrapper);
                    });
                }
                // ----------------------------------------------------
            }

            // --- Lógica Botón "+" Interno (Simplificado) ---
            const btnAdd = document.createElement('button');
            btnAdd.className = 'btn-add-floating';
            btnAdd.textContent = '+';
            btnAdd.type = 'button';
            btnAdd.title = 'Agregar Sub-sección'; // Tooltip simple

            // Acción directa: Agregar Sub-sección
            btnAdd.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();

                const subWrapper = document.createElement('div');
                subWrapper.className = 'dynamic-subsection-wrapper';
                subWrapper.style.marginTop = '15px';
                subWrapper.style.borderLeft = '2px solid #4dabf7';
                subWrapper.style.paddingLeft = '10px';

                // Span para numeración de subsección
                const subNumberSpan = document.createElement('span');
                subNumberSpan.className = 'subsection-number';
                subNumberSpan.style.color = '#4dabf7';
                subNumberSpan.style.marginRight = '10px';
                subNumberSpan.style.fontWeight = 'bold';

                const subTitleInput = document.createElement('input');
                subTitleInput.type = 'text';
                subTitleInput.className = 'dynamic-subsection-title';
                subTitleInput.placeholder = 'Título Subsección';
                subTitleInput.style.width = 'calc(100% - 40px)'; // Ajustar ancho
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

                btnRemoveSub.onclick = () => { subWrapper.remove(); updateLivePreview(); };

                subWrapper.appendChild(subNumberSpan); // Agregar número
                subWrapper.appendChild(subTitleInput); subWrapper.appendChild(subContentInput); subWrapper.appendChild(btnRemoveSub);
                contentWrapper.insertBefore(subWrapper, btnContainer);
                updateLivePreview();
            };

            const btnContainer = document.createElement('div');
            btnContainer.style.position = 'relative';
            btnContainer.style.marginTop = '15px';
            btnContainer.appendChild(btnAdd);
            contentWrapper.appendChild(btnContainer);
            // --- Fin Lógica Botón "+" ---
            accordionItem.appendChild(accordionContent);
            formElement.appendChild(accordionItem);
        });

        // ==========================================
        // LÓGICA DE INSERCIÓN DE SECCIONES (TIPO TEMPLATE BUILDER)
        // ==========================================

        // ==========================================
        // FUNCIÓN DE SINCRONIZACIÓN DE ESTADO (CRÍTICO PARA PERSISTENCIA)
        // ==========================================
        function syncFormStateToData() {
            // Recorrer todos los items del acordeón y actualizar globalParsedSections
            const accordionItems = document.querySelectorAll('.accordion-item');

            accordionItems.forEach((item, index) => {
                // Omitir sección de datos generales si está en el mismo contenedor (aunque usualmente tiene ID específico)
                if (item.id === 'accordion-general_data') return;

                // Encontrar el objeto de datos correspondiente
                // Nota: El índice en el DOM debería corresponder al índice en globalParsedSections
                // siempre y cuando no haya elementos extraños.
                // Como insertamos divisores, el índice del item en accordionItems (que solo selecciona .accordion-item)
                // debería coincidir con globalParsedSections[index].

                const sectionData = globalParsedSections[index];
                if (!sectionData) return;

                // 1. Sincronizar Título
                const headerInput = item.querySelector('.dynamic-main-section-title');
                if (headerInput) {
                    sectionData.title = headerInput.value;
                }

                // 2. Sincronizar Contenido Principal
                const mainContentInput = item.querySelector('.dynamic-main-section-content');
                if (mainContentInput) {
                    sectionData.content = mainContentInput.value;
                } else {
                    // Intentar buscar inputs estáticos si no es dinámico
                    const staticInput = item.querySelector(`textarea[id^="content_"]`);
                    if (staticInput) {
                        sectionData.content = staticInput.value;
                    }
                }

                // 3. Sincronizar Subsecciones Dinámicas
                // Esto es más complejo porque las subsecciones se crean en el DOM pero no tienen estructura previa en sectionData.subsecciones
                // Necesitamos reconstruir el array de subsecciones desde el DOM.

                const subWrappers = item.querySelectorAll('.dynamic-subsection-wrapper');
                const newSubsections = [];

                subWrappers.forEach(sub => {
                    const subTitle = sub.querySelector('.dynamic-subsection-title').value;
                    const subContent = sub.querySelector('.dynamic-subsection-content').value;

                    newSubsections.push({
                        title: subTitle,
                        content: subContent,
                        type: 'subsection' // Marcador para saber cómo renderizarlo después
                    });
                });

                // 4. Sincronizar Entregables (Nuevo)
                const deliverablesContainer = item.querySelector('.deliverables-container');
                if (deliverablesContainer) {
                    const typeSelect = item.querySelector('.form-select');
                    if (typeSelect) sectionData.deliverablesType = typeSelect.value;

                    const rows = deliverablesContainer.querySelectorAll('.deliverable-input-group');
                    sectionData.deliverables = [];
                    rows.forEach(row => {
                        sectionData.deliverables.push({
                            title: row.querySelector('.del-title').value,
                            desc: row.querySelector('.del-desc').value,
                            deadline: row.querySelector('.del-deadline').value
                        });
                    });
                }

                if (newSubsections.length > 0) {
                    sectionData.dynamicSubsections = newSubsections;
                }

                // Si la sección ya tenía subsecciones estáticas, ¿qué hacemos?
                // En el modelo actual, las secciones dinámicas empiezan vacías de subsecciones.
                // Las secciones estáticas tienen subsecciones predefinidas.
                // Si el usuario agrega subsecciones a una estática, se mezclan.
                // Por simplicidad y seguridad:
                // Si es dinámica, reemplazamos todo.
                // Si es estática, PRESERVAMOS las estáticas y añadimos las dinámicas al final?
                // O asumimos que las dinámicas se renderizan al final.

                if (sectionData.isDynamic) {
                    // Aseguramos que el contenido principal capturado arriba (paso 2) se mantenga
                    // y ADEMÁS guardamos las subsecciones.
                    sectionData.subsecciones = newSubsections;
                } else {
                    // Para estáticas, las subsecciones originales no se borran del DOM, 
                    // pero las NUEVAS agregadas con el botón "+" se deben guardar.
                    // El problema es que al re-renderizar, necesitamos saber cuáles son nuevas.
                    // Vamos a guardar las nuevas en una propiedad 'dynamicSubsections' para no romper la estructura original
                    sectionData.dynamicSubsections = newSubsections;
                }
            });
        }

        // Función para crear el divisor de inserción
        function createInsertDivider(index) {
            const divider = document.createElement('div');
            divider.className = 'insert-divider';
            if (index === 0) divider.classList.add('first-divider');

            const line = document.createElement('div');
            line.className = 'insert-divider-line';

            const btn = document.createElement('div');
            btn.className = 'insert-divider-button';
            btn.innerHTML = '<span>+</span> Insertar Sección Aquí';

            divider.appendChild(line);
            divider.appendChild(btn);

            divider.onclick = () => {
                insertNewSection(index);
            };

            return divider;
        }

        // Función para insertar una nueva sección en el array global y re-renderizar
        function insertNewSection(index) {
            // 1. GUARDAR ESTADO ACTUAL ANTES DE HACER NADA
            syncFormStateToData();

            const newId = `section_${Date.now()}`;
            const newSection = {
                id: newId,
                title: 'Nueva Sección', // Título por defecto
                content: '',
                instructivo: 'Ingrese el contenido de la nueva sección...',
                subsecciones: [],
                isDynamic: true // Flag para identificar secciones creadas dinámicamente
            };

            // Insertar en la posición específica
            if (!globalParsedSections || globalParsedSections.length === 0) {
                globalParsedSections = [newSection];
            } else {
                globalParsedSections.splice(index, 0, newSection);
            }

            // Re-renderizar todo el formulario
            renderInteractiveForm(globalParsedSections);

            // Scroll suave hacia la nueva sección
            setTimeout(() => {
                const newElement = document.getElementById(`accordion-${newId}`);
                if (newElement) {
                    newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const titleInput = newElement.querySelector('.dynamic-main-section-title');
                    if (titleInput) titleInput.select();
                }
            }, 100);
        }

        // Función para eliminar una sección del array global
        function deleteSection(id) {
            if (confirm('¿Eliminar esta sección completa?')) {
                // Sincronizar antes de borrar para no perder cambios en otras secciones
                syncFormStateToData();

                globalParsedSections = globalParsedSections.filter(s => s.id !== id);
                renderInteractiveForm(globalParsedSections);
            }
        }


        // Insertar Divisor Inicial
        formElement.appendChild(createInsertDivider(0));

        parsedSections.forEach((section, index) => {
            // ... (Lógica existente de creación de acordeón) ...
            // PERO necesitamos interceptar la creación para inyectar el divisor DESPUÉS de cada item
            // O mejor, inyectamos el divisor ANTES de cada item en el loop, excepto el 0 que ya lo pusimos fuera?
            // No, el patrón es: Divisor 0, Item 0, Divisor 1, Item 1...

            // Ya tenemos el accordionItem creado arriba (líneas 442-905 en el código original)
            // Vamos a REUTILIZAR ese código pero necesitamos que renderInteractiveForm sea idempotente y limpie todo antes (ya lo hace con innerHTML = '')

            // NOTA: Como estamos dentro del loop forEach original (línea 438), 
            // el código de creación del accordionItem ya se ejecutó y se hizo appendChild.
            // PERO, este bloque de reemplazo está ELIMINANDO el código viejo de "Agregar Botón al final".
            // Así que necesitamos insertar los divisores ENTRE los items que ya se han ido agregando.

            // ERROR DE LÓGICA EN EL PLANTEAMIENTO DE REEMPLAZO:
            // El bloque que estoy reemplazando (907-1231) está AL FINAL de la función renderInteractiveForm, 
            // DESPUÉS del loop forEach.
            // El loop forEach (438-905) ya agregó todos los items al formElement.
            // Si quiero intercalar divisores, necesito modificar el loop forEach o manipular el DOM después.

            // ESTRATEGIA CORREGIDA:
            // 1. Limpiar formElement de nuevo no es opción porque perderíamos el trabajo del loop anterior.
            // 2. Iterar sobre los hijos actuales de formElement e insertar divisores.
            // 3. O mejor: Modificar el loop forEach principal.

            // Dado que "replace_file_content" es para un bloque contiguo, y el loop está arriba...
            // Voy a hacer un "hotfix" post-renderizado aquí mismo.

            // No puedo modificar el loop de arriba fácilmente sin reemplazar TODO el archivo o un bloque gigante.
            // Así que voy a re-organizar el DOM aquí.
        });

        // RE-ORGANIZACIÓN DEL DOM PARA INSERTAR DIVISORES
        // Obtener todos los items de acordeón que se acaban de agregar
        const currentItems = Array.from(formElement.querySelectorAll('.accordion-item'));

        // Limpiar el formElement (solo de los items, manteniendo botones si los hubiera, aunque aquí aun no se agregan botones finales)
        formElement.innerHTML = '';

        // Volver a agregar con divisores intercalados
        currentItems.forEach((item, index) => {
            // Divisor antes del item
            formElement.appendChild(createInsertDivider(index));

            // Modificar el título del item para que sea editable si es dinámico O si queremos que todos sean editables
            // El usuario quiere "logica de template builder", donde los títulos son editables.
            // En el código original, solo las secciones nuevas tenían input.
            // Vamos a intentar hacer un "upgrade" visual al header aquí si es necesario, 
            // pero por ahora respetemos lo que ya se creó.

            // Sin embargo, necesitamos conectar el botón de eliminar para las secciones dinámicas
            // que se crean via insertNewSection.
            // En el código original, el botón de eliminar estaba dentro de la lógica de creación del modal.
            // Ahora, al renderizar desde globalParsedSections, necesitamos que el loop principal sepa cómo renderizar una sección dinámica.

            // PROBLEMA: El loop principal (líneas 438-905) no tiene lógica para renderizar inputs de título para secciones dinámicas
            // a menos que modifiquemos ese loop.
            // Si inserto una sección nueva en globalParsedSections, tiene {title: 'Nueva Sección'}.
            // El loop original hará: <h3>Nueva Sección</h3>. No será editable.

            // SOLUCIÓN: Necesito modificar el loop principal para soportar edición de título.
            // Como no puedo editar el loop principal en este bloque (está fuera del rango),
            // voy a aplicar un "parche" al elemento DOM 'item' aquí mismo.

            const sectionData = globalParsedSections[index];
            if (sectionData && (sectionData.isDynamic || sectionData.id.startsWith('section_'))) {
                // Transformar el header estático en uno editable
                const header = item.querySelector('.accordion-header');
                const h3 = header.querySelector('h3');
                if (h3) {
                    const currentTitle = h3.textContent;
                    h3.style.display = 'none'; // Ocultar h3

                    // Crear input si no existe
                    if (!header.querySelector('.dynamic-main-section-title')) {
                        const titleInput = document.createElement('input');
                        titleInput.type = 'text';
                        titleInput.className = 'dynamic-main-section-title';
                        titleInput.value = currentTitle;
                        titleInput.style.width = '70%';
                        titleInput.onclick = (e) => e.stopPropagation();
                        titleInput.onchange = (e) => {
                            sectionData.title = e.target.value;
                            updateLivePreview();
                        };

                        // Insertar ANTES del h3 (que está oculto pero sigue en el DOM después del número)
                        // Esto asegura que el orden sea: [Btn+] [Numero] [Input] [h3]
                        if (h3) {
                            header.insertBefore(titleInput, h3);
                        } else {
                            header.appendChild(titleInput);
                        }

                        // Agregar botón eliminar
                        const btnDelete = document.createElement('button');
                        btnDelete.textContent = '🗑️';
                        btnDelete.className = 'btn-ghost';
                        btnDelete.style.marginLeft = '10px';
                        btnDelete.onclick = (e) => {
                            e.stopPropagation();
                            deleteSection(sectionData.id);
                        };
                        header.appendChild(btnDelete);
                    }
                }
            }

            formElement.appendChild(item);
        });

        // Divisor final
        formElement.appendChild(createInsertDivider(currentItems.length));

        // El modal ya no se usa, así que no lo re-agregamos.

        updateLivePreview();


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
                    const sectionNumberSpan = item.querySelector('.section-number'); // Span de número en el form

                    let rawTitle = 'Sección';
                    if (headerH3) {
                        rawTitle = headerH3.textContent.trim();
                    } else if (headerInput) {
                        rawTitle = headerInput.value.trim() || 'Nueva Sección';
                    }

                    const cleanTitle = rawTitle.replace(/^\d+(\.\d+)*\.?\s*/, '');

                    // ACTUALIZAR NUMERACIÓN EN EL FORMULARIO (HEADER)
                    if (sectionNumberSpan) {
                        sectionNumberSpan.textContent = `${sectionCounter}.`;
                    }

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
                                const isDeliverablesContainer = child.classList.contains('deliverables-container');

                                if (isDeliverablesContainer) {
                                    flushContent();
                                    let tableHtml = '<table class="deliverables-table"><thead><tr><th>Entregable</th><th>Descripción</th><th>Plazo</th></tr></thead><tbody>';
                                    const rows = child.querySelectorAll('.deliverable-input-group');
                                    rows.forEach(row => {
                                        const title = row.querySelector('.del-title').value;
                                        const desc = row.querySelector('.del-desc').value;
                                        const deadline = row.querySelector('.del-deadline').value;
                                        tableHtml += `<tr><td>${title}</td><td>${desc}</td><td>${deadline}</td></tr>`;
                                    });
                                    tableHtml += '</tbody></table>';
                                    htmlContent += tableHtml;
                                } else if (isStaticTitle) {
                                    flushContent();
                                    const subCleanTitle = child.textContent.trim().replace(/^\d+(\.\d+)*\.?\s*/, '');

                                    // ACTUALIZAR NUMERACIÓN EN EL FORMULARIO (H4)
                                    child.textContent = `${sectionCounter}.${subCounter}. ${subCleanTitle}`;

                                    htmlContent += `<div class="doc-subsection-title" style="margin-top:10px; margin-left:15px;">${sectionCounter}.${subCounter}. ${subCleanTitle}</div>`;
                                    subCounter++;
                                } else if (isDynamicSubWrapper) {
                                    flushContent();
                                    const inputTitle = child.querySelector('.dynamic-subsection-title');
                                    const subNumberSpan = child.querySelector('.subsection-number'); // Span de número

                                    const val = inputTitle ? inputTitle.value.trim() : 'Subsección';

                                    // ACTUALIZAR NUMERACIÓN EN EL FORMULARIO (SUBSECCIÓN)
                                    if (subNumberSpan) {
                                        subNumberSpan.textContent = `${sectionCounter}.${subCounter}.`;
                                    }

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
