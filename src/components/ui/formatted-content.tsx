
import React from 'react';

interface FormattedContentProps {
  content: string;
  className?: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({
  content,
  className = ""
}) => {
  const formatContent = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('• ')) {
        // Bullet point
        elements.push(
          <li key={index} className="ml-4">
            {trimmedLine.substring(2)}
          </li>
        );
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        // Numbered list
        elements.push(
          <li key={index} className="ml-4">
            {trimmedLine.replace(/^\d+\.\s/, '')}
          </li>
        );
      } else if (trimmedLine === '') {
        // Empty line
        elements.push(<br key={index} />);
      } else {
        // Regular paragraph
        elements.push(
          <p key={index} className="mb-2">
            {trimmedLine}
          </p>
        );
      }
    });

    // Group consecutive list items
    const grouped: React.ReactNode[] = [];
    let currentBulletList: React.ReactNode[] = [];
    let currentNumberedList: React.ReactNode[] = [];

    elements.forEach((element, index) => {
      if (React.isValidElement(element) && element.type === 'li') {
        const originalLine = lines[index]?.trim() || '';
        if (originalLine.startsWith('• ')) {
          currentBulletList.push(element);
          if (currentNumberedList.length > 0) {
            grouped.push(
              <ol key={`numbered-${grouped.length}`} className="list-decimal list-inside mb-4">
                {currentNumberedList}
              </ol>
            );
            currentNumberedList = [];
          }
        } else if (/^\d+\.\s/.test(originalLine)) {
          currentNumberedList.push(element);
          if (currentBulletList.length > 0) {
            grouped.push(
              <ul key={`bullet-${grouped.length}`} className="list-disc list-inside mb-4">
                {currentBulletList}
              </ul>
            );
            currentBulletList = [];
          }
        }
      } else {
        if (currentBulletList.length > 0) {
          grouped.push(
            <ul key={`bullet-${grouped.length}`} className="list-disc list-inside mb-4">
              {currentBulletList}
            </ul>
          );
          currentBulletList = [];
        }
        if (currentNumberedList.length > 0) {
          grouped.push(
            <ol key={`numbered-${grouped.length}`} className="list-decimal list-inside mb-4">
              {currentNumberedList}
            </ol>
          );
          currentNumberedList = [];
        }
        grouped.push(element);
      }
    });

    // Add remaining lists
    if (currentBulletList.length > 0) {
      grouped.push(
        <ul key={`bullet-final`} className="list-disc list-inside mb-4">
          {currentBulletList}
        </ul>
      );
    }
    if (currentNumberedList.length > 0) {
      grouped.push(
        <ol key={`numbered-final`} className="list-decimal list-inside mb-4">
          {currentNumberedList}
        </ol>
      );
    }

    return grouped;
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {formatContent(content)}
    </div>
  );
};
