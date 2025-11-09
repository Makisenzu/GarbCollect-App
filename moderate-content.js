import Filter from 'bad-words';

const filter = new Filter();

const content = process.argv[2];

if (!content) {
    console.log(JSON.stringify({
        error: 'No content provided'
    }));
    process.exit(1);
}

try {
    const isProfane = filter.isProfane(content);
    const cleaned = filter.clean(content);
    
    console.log(JSON.stringify({
        flagged: isProfane,
        cleaned: cleaned,
        original: content
    }));
} catch (error) {
    console.log(JSON.stringify({
        error: error.message
    }));
    process.exit(1);
}
