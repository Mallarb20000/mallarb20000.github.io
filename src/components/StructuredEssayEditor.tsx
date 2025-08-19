'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EssaySection {
  id: string;
  title: string;
  content: string;
  placeholder: string;
}

interface StructuredEssayEditorProps {
  onEssayChange: (structuredEssay: { [key: string]: string }) => void;
  disabled?: boolean;
}

export default function StructuredEssayEditor({ onEssayChange, disabled = false }: StructuredEssayEditorProps) {
  const [sections, setSections] = useState<EssaySection[]>([
    {
      id: 'introduction',
      title: 'Introduction',
      content: '',
      placeholder: 'Write your introduction paragraph here. Include a hook, background, and thesis statement...'
    },
    {
      id: 'body1',
      title: 'Body Paragraph 1',
      content: '',
      placeholder: 'Write your first body paragraph. Start with a topic sentence, provide supporting details and examples...'
    },
    {
      id: 'body2',
      title: 'Body Paragraph 2',
      content: '',
      placeholder: 'Write your second body paragraph. Start with a topic sentence, provide supporting details and examples...'
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: '',
      placeholder: 'Write your conclusion paragraph. Restate your thesis, summarize main points, and provide final thoughts...'
    }
  ]);

  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  const handleSectionChange = (sectionId: string, content: string) => {
    const newSections = sections.map(section =>
      section.id === sectionId ? { ...section, content } : section
    );
    setSections(newSections);

    const structuredEssay = newSections.reduce((acc, section) => {
      acc[section.id] = section.content;
      return acc;
    }, {} as { [key: string]: string });

    onEssayChange(structuredEssay);
  };

  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, currentSectionId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = sections.findIndex(s => s.id === currentSectionId);
      const nextIndex = currentIndex + 1;
      
      if (nextIndex < sections.length) {
        const nextSectionId = sections[nextIndex].id;
        const nextTextarea = textareaRefs.current[nextSectionId];
        if (nextTextarea) {
          nextTextarea.focus();
          nextTextarea.setSelectionRange(0, 0);
        }
      }
    }
  };

  const addBodyParagraph = () => {
    const bodyCount = sections.filter(s => s.id.startsWith('body')).length;
    const newBodyId = `body${bodyCount + 1}`;
    const newSection: EssaySection = {
      id: newBodyId,
      title: `Body Paragraph ${bodyCount + 1}`,
      content: '',
      placeholder: `Write your body paragraph. Start with a topic sentence, provide supporting details and examples...`
    };

    const conclusionIndex = sections.findIndex(s => s.id === 'conclusion');
    const newSections = [
      ...sections.slice(0, conclusionIndex),
      newSection,
      ...sections.slice(conclusionIndex)
    ];
    
    setSections(newSections);
  };

  const removeBodyParagraph = (sectionId: string) => {
    if (sections.filter(s => s.id.startsWith('body')).length <= 2) return; // Keep minimum 2 body paragraphs
    
    const newSections = sections.filter(s => s.id !== sectionId);
    setSections(newSections);
    
    const structuredEssay = newSections.reduce((acc, section) => {
      acc[section.id] = section.content;
      return acc;
    }, {} as { [key: string]: string });
    
    onEssayChange(structuredEssay);
  };

  const getTotalWordCount = () => {
    return sections.reduce((total, section) => {
      if (!section.content.trim()) return total;
      return total + section.content.trim().split(/\s+/).length;
    }, 0);
  };

  const getSectionWordCount = (content: string) => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  };

  return (
    <div className="structured-essay-editor">
      {sections.map((section, index) => (
        <div key={section.id} className="essay-section">
          <div className="section-header">
            <div className="section-title-bar">
              <h3 className="section-title">{section.title}</h3>
              <div className="section-controls">
                {section.id.startsWith('body') && sections.filter(s => s.id.startsWith('body')).length > 2 && (
                  <button
                    type="button"
                    className="remove-section-btn"
                    onClick={() => removeBodyParagraph(section.id)}
                    disabled={disabled}
                    title="Remove this section"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="section-content">
            <textarea
              ref={el => {
                textareaRefs.current[section.id] = el;
                if (el) {
                  autoResize(el);
                }
              }}
              value={section.content}
              onChange={(e) => {
                handleSectionChange(section.id, e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={(e) => handleKeyDown(e, section.id)}
              placeholder={disabled ? 'Complete your planning notes first to unlock the essay editor...' : section.placeholder}
              disabled={disabled}
              className={`section-textarea ${disabled ? 'disabled' : ''}`}
              rows={5}
            />
          </div>
          
          {section.id.startsWith('body') && index === sections.findIndex(s => s.id === 'conclusion') - 1 && (
            <div className="add-paragraph-container">
              <button
                type="button"
                className="add-paragraph-btn"
                onClick={addBodyParagraph}
                disabled={disabled}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Body Paragraph
              </button>
            </div>
          )}
        </div>
      ))}
      
      <div className="essay-footer">
        <div className="total-word-count">
          {getTotalWordCount()} words
        </div>
        <div className="keyboard-help">
          <span className="help-text">Press Enter to move to next section</span>
        </div>
      </div>
    </div>
  );
}