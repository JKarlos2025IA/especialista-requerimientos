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
                        if (currentSection.subsecciones.length > 0) {
                            currentSection.subsecciones[currentSection.subsecciones.length - 1].content = contenido;
                        } else {
                            currentSection.content = contenido;
                        }
                        // Marcar que estamos capturando contenido
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
                // Acumular contenido de parrafos
                else if (line && !line.startsWith('#') && !line.startsWith('**') && currentSection) {
                    // Si estamos capturando contenido después de **Contenido:**
                    if (currentSection.capturandoContenido) {
                        currentSection.content += (currentSection.content ? '\n\n' : '') + line;
                    }
                    // Si no hay instructivo ni contenido definido, acumular
                    else if (currentSection.subsecciones.length > 0) {
                        const lastSub = currentSection.subsecciones[currentSection.subsecciones.length - 1];
                        if (!lastSub.instructivo && !lastSub.content) {
                            lastSub.content += (lastSub.content ? ' ' : '') + line;
                        }
                    } else if (!currentSection.instructivo && !currentSection.content) {
                        currentSection.content += (currentSection.content ? ' ' : '') + line;
                    }
                }
            }

            // Agregar ultima seccion
            if (currentSection) {
                sections.push(currentSection);
            }

            console.log('Secciones parseadas:', sections.length);
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

        parsedSections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'form-section';
            sectionDiv.id = `section-${section.id}`;

            const sectionHeader = document.createElement('h3');
            sectionHeader.textContent = section.title;
            sectionDiv.appendChild(sectionHeader);

            // Dynamically add controls based on section content and title
            if (section.id === 'general_data') {
                // Add "Item" first
                sectionDiv.appendChild(createTextInput('item', 'Item:', '', false, 'Ingrese el número o descripción del item', false, true)); // REQUERIDO

                // Then Meta, Unidad, Actividad (existing dynamic logic)
                sectionDiv.appendChild(createSelectInput('metaPresupuestaria', 'Meta Presupuestaria:', allMetasData.map(meta => ({ value: meta.id, text: meta.nombre })), '', 'Seleccione una Meta', false, true)); // REQUERIDO
                const metaSelect = sectionDiv.querySelector('#metaPresupuestaria');

                sectionDiv.appendChild(createTextInput('unidadOrganizacion', 'Unidad de Organización:', '', false, '', true)); // Readonly initially (auto-completa)
                const unidadInput = sectionDiv.querySelector('#unidadOrganizacion');

                sectionDiv.appendChild(createSelectInput('actividadPOI', 'Actividad del POI:', [], '', 'Seleccione actividades', true, true)); // REQUERIDO
                const actividadSelect = sectionDiv.querySelector('#actividadPOI');
                actividadSelect.setAttribute('multiple', 'true');
                actividadSelect.setAttribute('size', '5');

                sectionDiv.appendChild(createTextInput('denominacionContratacion', 'Denominación de la Contratación:', '', false, 'Ingrese la denominación del servicio', false, true)) // REQUERIDO


                metaSelect.addEventListener('change', (event) => {
                    const selectedMetaId = event.target.value;
                    const selectedMeta = allMetasData.find(meta => meta.id === selectedMetaId);

                    unidadInput.value = selectedMeta ? selectedMeta.unidad : '';
                    actividadSelect.innerHTML = ''; // Clear previous activities

                    if (selectedMeta && selectedMeta.actividades) {
                        selectedMeta.actividades.forEach(act => {
                            const option = document.createElement('option');
                            option.value = act.id;
                            option.textContent = act.nombre;
                            actividadSelect.appendChild(option);
                        });
                    }
                });

            } else if (section.title.includes('Finalidad Pública')) {
                sectionDiv.appendChild(createTextInput(`finalidadPublica_${section.id}`, section.title + ':', section.content, true, '(Describir el interés público que desea satisfacer con la contratación)'));
            } else if (section.title.includes('Antecedentes')) {
                sectionDiv.appendChild(createTextInput(`antecedentes_${section.id}`, section.title + ':', section.content, true, '(Puede consignarse una breve descripción de los antecedentes considerados por el usuario para la determinación de la necesidad...)'));
            } else if (section.title.includes('Objetivo')) {
                const generalContent = section.content.split('3.2 Objetivo Específico')[0].replace('3.1 Objetivo General', '').trim();
                const specificContent = section.content.split('3.2 Objetivo Específico')[1]?.trim() || '';
                sectionDiv.appendChild(createTextInput(`objetivoGeneral_${section.id}`, 'Objetivo General:', generalContent, true, 'Identificar la finalidad general hacia la cual se deben dirigir los recursos y esfuerzos...'));
                sectionDiv.appendChild(createTextInput(`objetivoEspecifico_${section.id}`, 'Objetivo Específico:', specificContent, true, 'Los objetivos específicos deben señalar con mayor precisión y detalle los propósitos concretos...'));
            } else if (section.title.includes('Alcance y Descripción del Servicio')) {
                sectionDiv.appendChild(createTextInput(`alcanceDescripcion_${section.id}`, section.title + ':', section.content, true, '(El área usuaria deberá Indicar el detalle de las actividades a desarrollar, así como el procedimiento a seguir...)'));
            } else if (section.title.includes('Requisitos del Proveedor y/o Personal')) {
                sectionDiv.appendChild(createTextInput(`requisitosProveedor_${section.id}`, section.title + ':', section.content, true, '(El área usuaria deberá precisar las características o condiciones mínimas que debe cumplir el proveedor...)'));
            } else if (section.title.includes('Perfeccionamiento')) {
                const options = [
                    { value: 'notificacion_pladicop', text: 'Se perfecciona con la notificación de la orden de servicio vía Pladicop' },
                    { value: 'suscripcion_contrato', text: 'Con la suscripción de un contrato' },
                    { value: 'notificacion_correo', text: 'Con la notificación vía correo electrónico de la orden de servicio' },
                    { value: 'otro', text: 'Otro (especifique)' }
                ];
                sectionDiv.appendChild(createRadioGroup(`perfeccionamiento_${section.id}`, section.title + ':', options, 'notificacion_pladicop'));
                const otroInput = createTextInput(`perfeccionamientoOtro_${section.id}`, 'Especifique otro perfeccionamiento:', '', false, 'Ingrese aquí el detalle');
                otroInput.style.display = 'none';
                sectionDiv.appendChild(otroInput);
                sectionDiv.querySelector(`#perfeccionamiento_${section.id}_otro`).addEventListener('change', (e) => {
                    otroInput.style.display = e.target.checked ? 'block' : 'none';
                });
            } else if (section.title.includes('Lugar y Plazo de Ejecución')) {
                // Select para Lugar de Ejecución
                const opcionesLugar = [
                    { value: 'instalaciones_entidad', text: 'En las instalaciones de la Junta Nacional de Justicia' },
                    { value: 'instalaciones_proveedor', text: 'En las instalaciones del proveedor' },
                    { value: 'modalidad_remota', text: 'Modalidad remota/virtual' },
                    { value: 'modalidad_mixta', text: 'Modalidad mixta (presencial y remota)' },
                    { value: 'otro', text: 'Otro (especifique)' }
                ];
                sectionDiv.appendChild(createSelectInput(`lugarEjecucion_${section.id}`, 'Lugar de Ejecución:', opcionesLugar, '', 'Seleccione el lugar de ejecución', false, true)); // REQUERIDO
                const otroLugarInput = createTextInput(`lugarEjecucionOtro_${section.id}`, 'Especifique otro lugar:', '', false, 'Indique el lugar específico');
                otroLugarInput.style.display = 'none';
                sectionDiv.appendChild(otroLugarInput);
                sectionDiv.querySelector(`#lugarEjecucion_${section.id}`).addEventListener('change', (e) => {
                    otroLugarInput.style.display = e.target.value === 'otro' ? 'block' : 'none';
                });

                // Select para Plazo de Ejecución
                const opcionesPlazo = [
                    { value: 'dia_siguiente', text: 'El servicio inicia a partir del día siguiente de notificada la orden de servicio' },
                    { value: 'suscripcion_acta', text: 'El servicio inicia a partir del día de notificada la orden de servicio y suscripción del acta de inicio' },
                    { value: 'personalizado', text: 'Personalizado (especifique)' }
                ];
                sectionDiv.appendChild(createSelectInput(`plazoEjecucion_${section.id}`, 'Plazo de Ejecución:', opcionesPlazo, 'dia_siguiente', 'Seleccione el plazo de ejecución', false, true)); // REQUERIDO
                const personalizadoInput = createTextInput(`plazoPersonalizado_${section.id}`, 'Especifique plazo personalizado:', '', false, 'Indique aquí el inicio del plazo de ejecución');
                personalizadoInput.style.display = 'none';
                sectionDiv.appendChild(personalizadoInput);
                sectionDiv.querySelector(`#plazoEjecucion_${section.id}`).addEventListener('change', (e) => {
                    personalizadoInput.style.display = e.target.value === 'personalizado' ? 'block' : 'none';
                });
            } else if (section.title.includes('Resultados Esperados-Entregables')) {
                // Select para tipo de entregables
                const opcionesEntregables = [
                    { value: 'informe_unico', text: 'Informe único al finalizar el servicio' },
                    { value: 'informes_mensuales', text: 'Informes mensuales de avance' },
                    { value: 'informes_quincenales', text: 'Informes quincenales de avance' },
                    { value: 'personalizado', text: 'Personalizado (describa los entregables)' }
                ];
                sectionDiv.appendChild(createSelectInput(`tipoEntregables_${section.id}`, 'Tipo de Entregables:', opcionesEntregables, '', 'Seleccione el tipo de entregables', false, true)); // REQUERIDO

                // Textarea para descripción detallada (se muestra siempre pero es obligatorio si elige "personalizado")
                sectionDiv.appendChild(createTextInput(`entregablesDescripcion_${section.id}`, 'Descripción Detallada de Entregables:', section.content, true, 'Indique número de entregables, contenido específico, plazos de entrega y condiciones relevantes...'));
            } else if (section.title.includes('Conformidad')) {
                const textoConformidad = `La conformidad del servicio será otorgada por el área usuaria o unidad orgánica responsable del seguimiento y supervisión del servicio contratado, dentro del plazo de siete (7) días hábiles contados a partir de la presentación del/los entregables por parte del contratista.

De existir observaciones, la JNJ las comunica al CONTRATISTA quien deberá subsanarlas en un plazo no mayor a tres (03) días hábiles. El cómputo del plazo para la conformidad se suspende desde la fecha en que se comunica la observación hasta que el CONTRATISTA subsana la misma.`;
                sectionDiv.appendChild(createTextInput(`conformidad_${section.id}`, 'Conformidad del Servicio (Editable):', textoConformidad, true, 'Puede modificar el texto según sea necesario...'));
            } else if (section.title.includes('Forma y Condiciones de Pago')) {
                sectionDiv.appendChild(createTextInput(`monedaPago_${section.id}`, 'Moneda de Pago:', 'INDICAR MONEDA'));
                sectionDiv.appendChild(createTextInput(`detallePago_${section.id}`, 'Detalle del Pago (Único, Parcial, a Cuenta):', 'INDICAR EL DETALLE DEL PAGO ÚNICO O PAGOS PARCIALES O PAGOS A CUENTA, SEGÚN CORRESPONDA', true));
                sectionDiv.appendChild(createTextInput(`documentacionPago_${section.id}`, 'Otra Documentación Necesaria para el Pago:', section.content.split('Para efectos del pago de las contraprestaciones ejecutadas por el contratista, la JNJ debe contar con la siguiente documentación:')[1]?.trim() || '', true, '- Documento en el que conste la conformidad...'));
            } else if (section.title.includes('Confidencialidad')) {
                const checkbox = createCheckbox(`incluirConfidencialidad_${section.id}`, 'Incluir Cláusula de Confidencialidad', false);
                sectionDiv.appendChild(checkbox);
                const textarea = createTextInput(`textoConfidencialidad_${section.id}`, 'Texto de la Cláusula de Confidencialidad:', section.content, true, '(De ser procedente, indicar la confidencialidad y reserva absoluta...)');
                textarea.style.display = checkbox.querySelector('input').checked ? 'block' : 'none';
                checkbox.querySelector('input').addEventListener('change', (e) => {
                    textarea.style.display = e.target.checked ? 'block' : 'none';
                });
                sectionDiv.appendChild(textarea);
            } else if (section.title.includes('Penalidades') && !section.title.includes('Otras')) { // Penalidad por Mora
                sectionDiv.appendChild(createTextInput(`penalidadMora_${section.id}`, 'Penalidad por Mora (Editable):', section.content, true, 'Puede modificar el texto según sea necesario...'));
            } else if (section.title.includes('Otras Penalidades')) {
                sectionDiv.appendChild(createTextInput(`otrasPenalidadesDescripcion_${section.id}`, 'Descripción de Otras Penalidades:', section.content, true, '(De acuerdo al tipo de contratación el área usuaria podrá establecer otras penalidades...)'));
            } else if (section.title.includes('Resolución del Contrato')) {
                const checkbox = createCheckbox(`incluirResolucionContrato_${section.id}`, 'Incluir Cláusula de Resolución del Contrato', true);
                sectionDiv.appendChild(checkbox);
                const p = document.createElement('p');
                p.className = 'static-clause';
                p.textContent = section.content;
                sectionDiv.appendChild(p);
                p.style.display = checkbox.querySelector('input').checked ? 'block' : 'none';
                checkbox.querySelector('input').addEventListener('change', (e) => {
                    p.style.display = e.target.checked ? 'block' : 'none';
                });
            } else if (section.title.includes('Cláusula Garantías')) {
                const checkbox = createCheckbox(`incluirGarantias_${section.id}`, 'Incluir Cláusula de Garantías', false);
                sectionDiv.appendChild(checkbox);
                const textarea = createTextInput(`textoGarantias_${section.id}`, 'Texto de la Cláusula de Garantías:', section.content, true);
                textarea.style.display = checkbox.querySelector('input').checked ? 'block' : 'none';
                checkbox.querySelector('input').addEventListener('change', (e) => {
                    textarea.style.display = e.target.checked ? 'block' : 'none';
                });
                sectionDiv.appendChild(textarea);
            } else if (section.title.includes('Cláusula Gestión de Riesgos')) {
                const checkbox = createCheckbox(`incluirGestionRiesgos_${section.id}`, 'Incluir Cláusula de Gestión de Riesgos', true);
                sectionDiv.appendChild(checkbox);
                const p = document.createElement('p');
                p.className = 'static-clause';
                p.textContent = section.content;
                sectionDiv.appendChild(p);
                p.style.display = checkbox.querySelector('input').checked ? 'block' : 'none';
                checkbox.querySelector('input').addEventListener('change', (e) => {
                    p.style.display = e.target.checked ? 'block' : 'none';
                });
            } else if (section.title.includes('Cláusula Anticorrupción y Antisoborno')) {
                const checkbox = createCheckbox(`incluirAnticorrupcion_${section.id}`, 'Incluir Cláusula Anticorrupción y Antisoborno', true);
                sectionDiv.appendChild(checkbox);
                const p = document.createElement('p');
                p.className = 'static-clause';
                p.textContent = section.content;
                sectionDiv.appendChild(p);
                p.style.display = checkbox.querySelector('input').checked ? 'block' : 'none';
                checkbox.querySelector('input').addEventListener('change', (e) => {
                    p.style.display = e.target.checked ? 'block' : 'none';
                });
            } else if (section.title.includes('Cláusula Solución de Controversias')) {
                const checkbox = createCheckbox(`incluirSolucionControversias_${section.id}`, 'Incluir Cláusula de Solución de Controversias', true);
                sectionDiv.appendChild(checkbox);
                const p = document.createElement('p');
                p.className = 'static-clause';
                p.textContent = section.content;
                sectionDiv.appendChild(p);
                p.style.display = checkbox.querySelector('input').checked ? 'block' : 'none';
                checkbox.querySelector('input').addEventListener('change', (e) => {
                    p.style.display = e.target.checked ? 'block' : 'none';
                });
            } else {
                // Fallback for any unhandled sections or simple content
                sectionDiv.appendChild(createTextInput(`content_${section.id}`, section.title + ':', section.content, true));
            }

            formElement.appendChild(sectionDiv);
        });

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

        // Funcion para recolectar datos del formulario
        function collectFormData() {
            const formData = {};
            const formElements = formElement.elements;

            for (const element of formElements) {
                if (element.name) {
                    if (element.type === 'radio') {
                        if (element.checked) {
                            formData[element.name] = element.value;
                        }
                    } else if (element.type === 'checkbox') {
                        formData[element.name] = element.checked;
                    } else if (element.tagName === 'SELECT' && element.multiple) {
                        formData[element.name] = Array.from(element.selectedOptions).map(option => option.value);
                    } else {
                        formData[element.name] = element.value;
                    }
                }
            }
            return formData;
        }

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
