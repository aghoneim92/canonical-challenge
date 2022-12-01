import './style.scss';

const template = document.getElementById('cardTemplate');
const cardsRow = document.getElementById('cardsRow');

function getTerms(termGroups) {
  const topics = termGroups.find(
    termGroup => termGroup[0]?.taxonomy === 'topic',
  );
  const categories = termGroups.find(
    termGroup => termGroup[0]?.taxonomy === 'category',
  );
  const groups = termGroups.find(
    termGroup => termGroup[0]?.taxonomy === 'group',
  );
  const tags = termGroups.find(
    termGroup => termGroup[0]?.taxonomy === 'post_tag',
  );
  return { topics, categories, groups, tags };
}

function formatDate(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-GB', options);
}

fetch('https://people.canonical.com/~anthonydillon/wp-json/wp/v2/posts.json')
  .then(res => res.json())
  .then(items => {
    items.forEach(
      ({
        group,
        categories: category,
        topic,
        tags: tag,
        featured_media,
        _embedded: { 'wp:term': termGroups, author: authors },
        title,
        link,
        author,
        date_gmt,
      }) => {
        const { topics, categories, groups, tags } = getTerms(termGroups);
        const firstTopic = topics?.find(topicItem => topicItem.id === topic[0]);
        const firstCategory = categories?.find(
          categoryItem => categoryItem.id === category[0],
        );
        const firstGroup = groups?.find(groupItem => groupItem.id === group[0]);
        const firstTag = tags?.find(tagItem => tagItem.id === tag[0]);
        const firstAuthor = authors?.find(
          authorItem => authorItem.id === author,
        );

        const clone = template.content.cloneNode(true);

        clone.querySelector('.topic').innerHTML =
          (firstTopic || firstGroup || firstTag)?.name ?? '';
        clone.querySelector('.p-card__image').src = featured_media;
        clone.querySelector('.title__link').innerHTML = title.rendered;
        clone.querySelector('.title__link').href = link;
        if (firstAuthor) {
          clone.querySelector('.author__by').innerHTML = 'By ';
          clone.querySelector('.author__link').innerHTML = firstAuthor.name;
          clone.querySelector('.author__link').href = firstAuthor.link;
        }
        clone.querySelector('.date').innerHTML = `${
          firstAuthor ? ' on' : 'On'
        } ${formatDate(date_gmt)}`;
        const firstCategoryName = firstCategory?.name;
        clone.querySelector('.category').innerHTML =
          firstCategoryName === 'Articles'
            ? 'Article'
            : firstCategoryName ?? '';

        cardsRow.appendChild(clone);
      },
    );
  });
