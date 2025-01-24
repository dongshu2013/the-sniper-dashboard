import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AiIcon } from '@/components/icons/ai-icon';
import { MemecoinIcon } from '@/components/icons/memecoin-icon';
import { ChatMetadata } from '@/lib/types';

interface EntityCardProps {
  chat: ChatMetadata;
}

interface CryptoProjectEntity {
  ticker: string;
  chain: string;
  contract: string;
  website: string;
  name: string;
  social?: {
    twitter?: string;
    other?: string[];
  };
}

interface KOLEntity {
  name: string;
  username: string;
  website: string;
  social?: {
    twitter?: string;
    telegram?: string;
    linkedin?: string;
    other?: string[];
  };
}

interface VirtualCapitalEntity {
  name: string;
  website: string;
  social?: {
    twitter?: string;
    linkedin?: string;
  };
}

export function EntityCard({ chat }: EntityCardProps) {
  if (!chat.entity) {
    return null;
  }

  const entity = chat.entity as NonNullable<typeof chat.entity>;

  const renderLink = (url: string | undefined) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline break-all"
      >
        {url}
      </a>
    );
  };

  const renderEntityFields = () => {
    switch (chat.category) {
      case 'CRYPTO_PROJECT':
        const cryptoEntity = entity as CryptoProjectEntity;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="mt-1">{cryptoEntity.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ticker</div>
              <div className="mt-1">{cryptoEntity.ticker}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Chain</div>
              <div className="mt-1">{cryptoEntity.chain}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Contract</div>
              <div className="mt-1 font-mono text-sm break-all">
                {cryptoEntity.contract}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">Website</div>
              <div className="mt-1">{renderLink(cryptoEntity.website)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">Twitter</div>
              <div className="mt-1">
                {renderLink(cryptoEntity.social?.twitter)}
              </div>
            </div>
            {cryptoEntity.social?.other &&
              cryptoEntity.social.other.length > 0 && (
                <div className="col-span-2">
                  <div className="text-sm text-muted-foreground">
                    Other Links
                  </div>
                  <div className="mt-1 space-y-1">
                    {cryptoEntity.social.other.map((link, index) => (
                      <div key={index}>{renderLink(link)}</div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        );

      case 'KOL':
        const kolEntity = entity as KOLEntity;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="mt-1">{kolEntity.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Username</div>
              <div className="mt-1">{kolEntity.username}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">Website</div>
              <div className="mt-1">{renderLink(kolEntity.website)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Twitter</div>
              <div className="mt-1">
                {renderLink(kolEntity.social?.twitter)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Telegram</div>
              <div className="mt-1">
                {renderLink(kolEntity.social?.telegram)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">LinkedIn</div>
              <div className="mt-1">
                {renderLink(kolEntity.social?.linkedin)}
              </div>
            </div>
            {kolEntity.social?.other && kolEntity.social.other.length > 0 && (
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground">Other Links</div>
                <div className="mt-1 space-y-1">
                  {kolEntity.social.other.map((link, index) => (
                    <div key={index}>{renderLink(link)}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'VIRTUAL_CAPITAL':
        const vcEntity = entity as VirtualCapitalEntity;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="mt-1">{vcEntity.name}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground">Website</div>
              <div className="mt-1">{renderLink(vcEntity.website)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Twitter</div>
              <div className="mt-1">{renderLink(vcEntity.social?.twitter)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">LinkedIn</div>
              <div className="mt-1">
                {renderLink(vcEntity.social?.linkedin)}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Entity {chat.category && `(${chat.category})`}</CardTitle>
          <AiIcon className="h-4 w-7" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">{renderEntityFields()}</div>
      </CardContent>
    </Card>
  );
}
