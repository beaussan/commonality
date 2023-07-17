import { Constraint } from '@commonalityco/types';
import {
  AccordionContent,
  Label,
  Badge,
} from '@commonalityco/ui-design-system';

export function ConstraintAccordionContent({
  constraint,
  children,
}: {
  constraint: Constraint;
  children?: React.ReactNode;
}) {
  return (
    <AccordionContent className="w-full">
      <div className="flex w-full flex-col gap-4">
        <div className="flex w-full flex-col gap-4">
          {'allow' in constraint && (
            <div className="flex w-full flex-col gap-2">
              <div className="flex items-center gap-1">
                <Label className="text-xs">
                  Allow only direct dependencies tagged:
                </Label>
              </div>
              <div className="flex w-full flex-wrap gap-1">
                {constraint.allow === '*' ? (
                  <p className="text-xs">All packages</p>
                ) : (
                  constraint.allow.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="block min-w-0"
                    >{`#${tag}`}</Badge>
                  ))
                )}
              </div>
            </div>
          )}
          {'disallow' in constraint && (
            <div className="flex w-full flex-col gap-2">
              <div className="flex items-center gap-1">
                <Label className="text-xs">
                  Disallow any dependency tagged:
                </Label>
              </div>
              <div className="flex w-full flex-wrap gap-1">
                {constraint.disallow === '*' ? (
                  <p className="text-xs">All packages</p>
                ) : (
                  constraint.disallow.map((tag) => (
                    <Badge
                      variant="secondary"
                      key={tag}
                      className="block min-w-0"
                    >{`#${tag}`}</Badge>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {children}
      </div>
    </AccordionContent>
  );
}
