import React from 'react';
import { RiskSettings } from '../lib/risk-manager';
import { Settings as SettingsIcon, Save, Play, Square, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface SettingsPanelProps {
  settings: RiskSettings;
  onUpdate: (settings: Partial<RiskSettings>) => void;
  isRunning: boolean;
  onToggleBot: () => void;
}

export const SettingsPanel = ({ settings, onUpdate, isRunning, onToggleBot }: SettingsPanelProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border h-full flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
        <h3 className="font-semibold flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" />
          Bot Configuration
        </h3>
        <Button 
          variant={isRunning ? "destructive" : "default"} 
          size="sm"
          onClick={onToggleBot}
          className="rounded-full px-6 font-bold"
        >
          {isRunning ? (
            <><Square className="w-4 h-4 mr-2 fill-current" /> STOP BOT</>
          ) : (
            <><Play className="w-4 h-4 mr-2 fill-current" /> START BOT</>
          )}
        </Button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Auto Trade</Label>
              <p className="text-xs text-muted-foreground">Execute trades automatically based on AI signals</p>
            </div>
            <Switch 
              checked={settings.autoTrade} 
              onCheckedChange={(val) => onUpdate({ autoTrade: val })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Stake Amount ($)</Label>
              <Input 
                type="number" 
                value={settings.stake}
                onChange={(e) => onUpdate({ stake: Number(e.target.value) })}
                className="bg-muted/50 border-none h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Min Confidence (%)</Label>
              <Input 
                type="number" 
                value={settings.minConfidence}
                onChange={(e) => onUpdate({ minConfidence: Number(e.target.value) })}
                className="bg-muted/50 border-none h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Profit Target ($)</Label>
              <Input 
                type="number" 
                value={settings.dailyProfitTarget}
                onChange={(e) => onUpdate({ dailyProfitTarget: Number(e.target.value) })}
                className="bg-muted/50 border-none h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Loss Limit ($)</Label>
              <Input 
                type="number" 
                value={settings.dailyLossLimit}
                onChange={(e) => onUpdate({ dailyLossLimit: Number(e.target.value) })}
                className="bg-muted/50 border-none h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Cooldown (s)</Label>
              <Input 
                type="number" 
                value={settings.cooldownSeconds}
                onChange={(e) => onUpdate({ cooldownSeconds: Number(e.target.value) })}
                className="bg-muted/50 border-none h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground">Max Loss Streak</Label>
              <Input 
                type="number" 
                value={settings.maxConsecutiveLosses}
                onChange={(e) => onUpdate({ maxConsecutiveLosses: Number(e.target.value) })}
                className="bg-muted/50 border-none h-11"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
            Trading involves significant risk. The AI bot does not guarantee profits. 
            Ensure your stake and limits are configured responsibly.
          </p>
        </div>
      </div>
    </div>
  );
};
