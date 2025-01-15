async function analyzeURL() {
    const url = document.getElementById('urlInput').value;
    if (!url) {
        alert('Por favor, introduce una URL válida.');
        return;
    }

    showProgressBar();

    try {
        const start = performance.now();
        const response = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url));
        const data = await response.json();
        const htmlContent = data.contents;
        const end = performance.now();
        const responseTime = end - start;

        document.getElementById('responseTime').textContent = responseTime.toFixed(2) + ' ms';

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        const title = doc.querySelector('title') ? doc.querySelector('title').innerText : 'Sin título';
        const metaDescription = doc.querySelector('meta[name="description"]') ? doc.querySelector('meta[name="description"]').getAttribute('content') : 'No description';
        const h1Tags = doc.querySelectorAll('h1');
        const h2Tags = doc.querySelectorAll('h2');
        const h3Tags = doc.querySelectorAll('h3');
        const h4Tags = doc.querySelectorAll('h4');
        const h5Tags = doc.querySelectorAll('h5');
        const links = doc.querySelectorAll('a');
        const images = doc.querySelectorAll('img');
        const structuredData = doc.querySelectorAll('script[type="application/ld+json"]');
        const words = doc.body.innerText.match(/\b\w+\b/g);
        const visibleText = doc.body.innerText.replace(/\s+/g, ' ').trim();

        let internalLinks = 0;
        let externalLinks = 0;
        let imagesWithAlt = 0;
        const currentDomain = new URL(url).origin;
        links.forEach(link => {
            if (link.href.startsWith(currentDomain)) {
                internalLinks++;
            } else {
                externalLinks++;
            }
        });

        images.forEach(image => {
            if (image.hasAttribute('alt')) {
                imagesWithAlt++;
            }
        });

        document.getElementById('pageTitle').textContent = title;
        document.getElementById('metaDescription').textContent = metaDescription;
        document.getElementById('titleLength').textContent = title.length;
        document.getElementById('metaDescriptionLength').textContent = metaDescription.length;
        document.getElementById('internalLinksCount').textContent = internalLinks;
        document.getElementById('externalLinksCount').textContent = externalLinks;
        document.getElementById('wordCount').textContent = words ? words.length : 0;
        document.getElementById('charCount').textContent = visibleText.length;
        document.getElementById('imageCount').textContent = images.length;
        document.getElementById('imageAltCount').textContent = imagesWithAlt;
        document.getElementById('structuredDataCount').textContent = structuredData.length;
        document.getElementById('h1Count').textContent = h1Tags.length;
        document.getElementById('h2Count').textContent = h2Tags.length;
        document.getElementById('h3Count').textContent = h3Tags.length;
        document.getElementById('h4Count').textContent = h4Tags.length;
        document.getElementById('h5Count').textContent = h5Tags.length;
        
        const schemas = structuredData.length > 0 ? JSON.stringify(JSON.parse(structuredData[0].innerText), null, 2) : 'No schema found';
        document.getElementById('schemas').textContent = schemas;

        // Set statuses
        const statusData = [];
        const icons = {
            correct: '✔️',
            incorrect: '❌',
            neutral: '↔️'
        };
        statusData.push({
            aspect: 'Título',
            result: title.length,
            status: (title.length >= 50 && title.length <= 60) ? icons.correct : icons.incorrect,
            recommendation: 'Longitud recomendada: 50-60 caracteres.'
        });
        statusData.push({
            aspect: 'Meta Descripción',
            result: metaDescription.length,
            status: (metaDescription.length >= 120 && metaDescription.length <= 160) ? icons.correct : icons.incorrect,
            recommendation: 'Longitud recomendada: 120-160 caracteres.'
        });
        statusData.push({
            aspect: 'Enlaces internos',
            result: internalLinks,
            status: internalLinks >= 12 ? icons.correct : icons.incorrect,
            recommendation: '12 o superior es correcto.'
        });
        statusData.push({
            aspect: 'Enlaces externos',
            result: externalLinks,
            status: externalLinks >= 2 ? icons.correct : icons.incorrect,
            recommendation: '2 o superior es correcto.'
        });
        statusData.push({
            aspect: 'Palabras',
            result: words ? words.length : 0,
            status: words && words.length >= 1300 ? icons.correct : icons.incorrect,
            recommendation: '1300 o superior es correcto.'
        });
        statusData.push({
            aspect: 'Imágenes',
            result: images.length,
            status: images.length >= 3 ? icons.correct : icons.incorrect,
            recommendation: '3 o superior es correcto.'
        });
        statusData.push({
            aspect: 'Imágenes con alt',
            result: imagesWithAlt,
            status: imagesWithAlt >= 2 ? icons.correct : icons.incorrect,
            recommendation: '2 o superior es correcto.'
        });
        statusData.push({
            aspect: 'Datos Estructurados',
            result: structuredData.length,
            status: structuredData.length >= 1 ? icons.correct : icons.incorrect,
            recommendation: '1 o superior es correcto.'
        });
        statusData.push({
            aspect: 'H1',
            result: h1Tags.length,
            status: h1Tags.length === 1 ? icons.correct : icons.incorrect,
            recommendation: 'Debe ser 1.'
        });
        statusData.push({
            aspect: 'H2',
            result: h2Tags.length,
            status: h2Tags.length >= 1 ? icons.correct : icons.incorrect,
            recommendation: '1 o superior es correcto.'
        });
        statusData.push({
            aspect: 'H3',
            result: h3Tags.length,
            status: h3Tags.length >= 1 ? icons.correct : icons.incorrect,
            recommendation: '1 o superior es correcto.'
        });

        // Update the status icons
        document.getElementById('titleLengthStatus').textContent = statusData[0].status;
        document.getElementById('metaDescriptionStatus').textContent = statusData[1].status;
        document.getElementById('internalLinksStatus').textContent = statusData[2].status;
        document.getElementById('externalLinksStatus').textContent = statusData[3].status;
        document.getElementById('wordCountStatus').textContent = statusData[4].status;
        document.getElementById('imageCountStatus').textContent = statusData[5].status;
        document.getElementById('imageAltStatus').textContent = statusData[6].status;
        document.getElementById('structuredDataStatus').textContent = statusData[7].status;
        document.getElementById('h1Status').textContent = statusData[8].status;
        document.getElementById('h2Status').textContent = statusData[9].status;
        document.getElementById('h3Status').textContent = statusData[10].status;

        updateRecommendationsTable(statusData);
        createScoreChart(statusData);

        // Update URL preview
        document.getElementById('urlPreview').src = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

        hideProgressBar();
    } catch (error) {
        console.error('Error al analizar la URL:', error);
        alert('Hubo un error al analizar la URL. Por favor, intenta nuevamente.');
        hideProgressBar();
    }
}

function showProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressBarInner = progressBar.querySelector('div');
    progressBar.style.display = 'block';
    let width = 1;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width++;
            progressBarInner.style.width = width + '%';
            progressBarInner.textContent = width + '%';
        }
    }, 100);
}

function hideProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.display = 'none';
    progressBar.querySelector('div').style.width = '0';
}

function updateRecommendationsTable(data) {
    const tableBody = document.querySelector('#recommendationsTable tbody');
    tableBody.innerHTML = '';
    
    data.forEach(item => {
        const row = document.createElement('tr');
        const aspectCell = document.createElement('td');
        const resultCell = document.createElement('td');
        const statusCell = document.createElement('td');
        const recommendationCell = document.createElement('td');

        aspectCell.textContent = item.aspect;
        resultCell.textContent = item.result;
        statusCell.textContent = item.status;
        recommendationCell.textContent = item.recommendation;

        row.appendChild(aspectCell);
        row.appendChild(resultCell);
        row.appendChild(statusCell);
        row.appendChild(recommendationCell);

        tableBody.appendChild(row);
    });
}

function createScoreChart(data) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    const correctCount = data.filter(item => item.status === '✔️').length;
    const incorrectCount = data.filter(item => item.status === '❌').length;
    const neutralCount = data.filter(item => item.status === '↔️').length;

    const total = correctCount + incorrectCount + neutralCount;
    const percentage = (correctCount / total) * 100;
    const score = (percentage / 10).toFixed(1);

    document.getElementById('scoreNote').innerHTML = `<h3>Nota: ${score}/10</h3>`;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Correcto', 'Incorrecto', 'Neutral'],
            datasets: [{
                data: [correctCount, incorrectCount, neutralCount],
                backgroundColor: ['#28a745', '#dc3545', '#6c757d']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Puntuación de la Página'
                }
            }
        }
    });
}

async function saveReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // First page content
    const resultsElement = document.getElementById('results');
    const recommendationsTableElement = document.getElementById('recommendationsTable');
    const scoreChartElement = document.getElementById('scoreChart');

    // Convert results to canvas and add to PDF
    const resultsCanvas = await html2canvas(resultsElement, { scale: 2 });
    const resultsImg = resultsCanvas.toDataURL('image/png');
    doc.addImage(resultsImg, 'PNG', 10, 10, 190, 80);

    // Convert recommendations table to canvas and add to PDF
    const recommendationsCanvas = await html2canvas(recommendationsTableElement, { scale: 2 });
    const recommendationsImg = recommendationsCanvas.toDataURL('image/png');
    doc.addImage(recommendationsImg, 'PNG', 10, 100, 190, 80);

    // Convert score chart to canvas and add to PDF
    const scoreChartCanvas = await html2canvas(scoreChartElement, { scale: 2 });
    const scoreChartImg = scoreChartCanvas.toDataURL('image/png');
    doc.addImage(scoreChartImg, 'PNG', 10, 190, 190, 80);
    
    // Add new page for schema
    doc.addPage();

    // Add schema title
    doc.setFontSize(16);
    doc.text('Schema', 10, 20);

    // Convert schema to canvas and add to PDF
    const schemaElement = document.getElementById('schemas');
    const schemaCanvas = await html2canvas(schemaElement, { scale: 2 });
    const schemaImg = schemaCanvas.toDataURL('image/png');
    doc.addImage(schemaImg, 'PNG', 10, 30, 190, 260);

    // Save the PDF
    doc.save('seo_report.pdf');
}
