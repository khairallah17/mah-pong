import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

// Article metadata component
const ArticleMetadata = ({ metadata }) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
    <h2 className="text-xl font-bold mb-3">{metadata.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="font-semibold mb-2">Primary Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {metadata.primaryKeywords.map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {keyword}
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Secondary Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {metadata.secondaryKeywords.map((keyword, index) => (
            <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
              {keyword}
            </span>
          ))}
        </div>
      </div>
      <div className="col-span-1 md:col-span-2 mt-2">
        <p className="text-sm text-gray-600">
          Author: {metadata.author} | Date: {metadata.dateCreated}
          {metadata.subject && ` | Subject: ${metadata.subject}`}
          {metadata.historicalDate && ` | Historical Date: ${metadata.historicalDate}`}
        </p>
      </div>
    </div>
  </div>
);

// Section content component
const SectionContent = ({ content, benefits, features, requirements }) => (
  <div className="mb-4">
    {content && <p className="mb-4 text-gray-700">{content}</p>}
    {benefits && (
      <ul className="list-disc pl-6 mb-4">
        {benefits.map((benefit, index) => (
          <li key={index} className="text-gray-700 mb-2">{benefit}</li>
        ))}
      </ul>
    )}
    {features && (
      <ul className="list-disc pl-6 mb-4">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-700 mb-2">{feature}</li>
        ))}
      </ul>
    )}
    {requirements && (
      <div className="mt-4">
        {Object.entries(requirements).map(([mode, data]) => (
          <div key={mode} className="mb-4">
            <h4 className="font-semibold mb-2">{mode.replace('_', ' ')}</h4>
            <ul className="list-disc pl-6">
              {data.requirements.map((req, index) => (
                <li key={index} className="text-gray-700 mb-1">{req}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Subsection component with collapsible functionality
const Subsection = ({ subsection }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4 pl-4 border-l-2 border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 font-semibold text-gray-800 mb-2 hover:text-blue-600"
      >
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        {subsection.title || subsection.subtitle}
      </button>
      {isOpen && (
        <div className="pl-6">
          <SectionContent
            content={subsection.content}
            benefits={subsection.benefits}
            features={subsection.features}
            requirements={subsection.requirements}
          />
          {subsection.techniques && (
            <ul className="list-disc pl-6">
              {subsection.techniques.map((technique, index) => (
                <li key={index} className="text-gray-700 mb-2">{technique}</li>
              ))}
            </ul>
          )}
          {subsection.controlPoints && (
            <ul className="list-disc pl-6">
              {subsection.controlPoints.map((point, index) => (
                <li key={index} className="text-gray-700 mb-2">{point}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// Section component
const Section = ({ section }) => (
  <div className="mb-8">
    <h3 className="text-xl font-bold mb-4">{section.title}</h3>
    <SectionContent
      content={section.content}
      benefits={section.benefits}
      features={section.features}
      requirements={section.requirements}
    />
    {section.subsections && section.subsections.map((subsection, index) => (
      <Subsection key={index} subsection={subsection} />
    ))}
  </div>
);

// Main article component
const Article = ({ article }) => (
  <article className="max-w-4xl mx-auto p-6">
    <ArticleMetadata metadata={article.metadata} />
    
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">{article.content.introduction.title}</h3>
      <p className="text-gray-700">{article.content.introduction.content}</p>
    </div>
    
    {article.content.sections.map((section, index) => (
      <Section key={index} section={section} />
    ))}
  </article>
);

// Navigation component
const ArticleNavigation = ({ articles, currentIndex, onChangeArticle }) => (
  <div className="flex justify-between items-center max-w-4xl mx-auto p-4 bg-white border-b">
    <button
      onClick={() => onChangeArticle(currentIndex - 1)}
      disabled={currentIndex === 0}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Previous Article
    </button>
    <span className="text-gray-600">
      Article {currentIndex + 1} of {articles.length}
    </span>
    <button
      onClick={() => onChangeArticle(currentIndex + 1)}
      disabled={currentIndex === articles.length - 1}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Next Article
    </button>
  </div>
);

// Main app component
const ArticleViewer = () => {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await window.fs.readFile('articles.json', { encoding: 'utf8' });
        const data = JSON.parse(response);
        setArticles(data.articleCollection.articles);
      } catch (error) {
        console.error('Error loading articles:', error);
      }
    };
    
    fetchArticles();
  }, []);

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ArticleNavigation
        articles={articles}
        currentIndex={currentIndex}
        onChangeArticle={setCurrentIndex}
      />
      <div className="container mx-auto py-8">
        <Article article={articles[currentIndex].article} />
      </div>
    </div>
  );
};

export default ArticleViewer;