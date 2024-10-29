class LinkManager {
    constructor() {
        this.links = JSON.parse(localStorage.getItem('links')) || [];
        this.setupEventListeners();
        this.renderLinks();
    }

    setupEventListeners() {
        document.getElementById('addLinkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLink();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterLinks(e.target.value);
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportLinks();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importInput').click();
        });

        document.getElementById('importInput').addEventListener('change', (e) => {
            this.importLinks(e);
        });
    }

    addLink() {
        const url = document.getElementById('linkUrl').value;
        const title = document.getElementById('linkTitle').value;
        const tags = document.getElementById('linkTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);

        const newLink = {
            id: Date.now(),
            url,
            title: title || url,
            tags,
            timestamp: new Date().toISOString(),
        };

        this.links.push(newLink);
        this.saveLinks();
        this.renderLinks();
        this.resetForm();
    }

    deleteLink(id) {
        this.links = this.links.filter(link => link.id !== id);
        this.saveLinks();
        this.renderLinks();
    }

    editLink(id) {
        const link = this.links.find(link => link.id === id);
        if (!link) return;

        const newUrl = prompt('Edit URL:', link.url);
        const newTitle = prompt('Edit Title:', link.title);
        const newTags = prompt('Edit Tags (comma-separated):', link.tags.join(','));

        if (newUrl && newTitle) {
            link.url = newUrl;
            link.title = newTitle;
            link.tags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
            this.saveLinks();
            this.renderLinks();
        }
    }

    filterLinks(searchTerm) {
        const filteredLinks = this.links.filter(link => 
            link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderLinks(filteredLinks);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    exportLinks() {
        const dataStr = JSON.stringify(this.links, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'links-backup.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    importLinks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedLinks = JSON.parse(e.target.result);
                this.links = [...this.links, ...importedLinks];
                this.saveLinks();
                this.renderLinks();
                alert('Links imported successfully!');
            } catch (err) {
                alert('Error importing links. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }

    saveLinks() {
        localStorage.setItem('links', JSON.stringify(this.links));
    }

    resetForm() {
        document.getElementById('addLinkForm').reset();
    }

    renderLinks(linksToRender = this.links) {
        const linksDisplay = document.getElementById('linksDisplay');
        linksDisplay.innerHTML = '';

        linksToRender.forEach(link => {
            const linkCard = document.createElement('div');
            linkCard.className = 'link-card';
            linkCard.innerHTML = `
                <h3>${link.title}</h3>
                <p><a href="${link.url}" target="_blank">${link.url}</a></p>
                <p>Tags: ${link.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</p>
                <p>Added: ${new Date(link.timestamp).toLocaleString()}</p>
                <div class="link-actions">
                    <button onclick="linkManager.copyToClipboard('${link.url}')">Copy</button>
                    <button onclick="linkManager.editLink(${link.id})">Edit</button>
                    <button onclick="linkManager.deleteLink(${link.id})">Delete</button>
                </div>
            `;
            linksDisplay.appendChild(linkCard);
        });
    }
}

const linkManager = new LinkManager();
