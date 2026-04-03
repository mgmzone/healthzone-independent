import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Leaf } from 'lucide-react';
import { ProteinSource } from '@/lib/types';

interface ProteinSourceManagerProps {
  sources: ProteinSource[];
  onAdd: (data: Partial<ProteinSource>) => Promise<any>;
  onUpdate: (id: string, data: Partial<ProteinSource>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

const ProteinSourceManager: React.FC<ProteinSourceManagerProps> = ({
  sources,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGrams, setNewGrams] = useState('');
  const [newAntiInflammatory, setNewAntiInflammatory] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await onAdd({
      name: newName.trim(),
      typicalProteinGrams: newGrams ? parseFloat(newGrams) : undefined,
      isAntiInflammatory: newAntiInflammatory,
      sortOrder: sources.length,
    });
    setNewName('');
    setNewGrams('');
    setNewAntiInflammatory(false);
    setShowAddForm(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Protein Sources</CardTitle>
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Food
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your common protein foods for quick meal logging.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddForm && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Food Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Chicken breast (6oz)"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Typical Protein (g)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newGrams}
                    onChange={(e) => setNewGrams(e.target.value)}
                    placeholder="e.g. 42"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="new-anti-inflammatory"
                  checked={newAntiInflammatory}
                  onCheckedChange={(checked) => setNewAntiInflammatory(checked === true)}
                />
                <Label htmlFor="new-anti-inflammatory" className="text-sm cursor-pointer">
                  Anti-inflammatory food
                </Label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {sources.length === 0 && !showAddForm ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No protein sources yet. Add your common foods for quick logging.
            </p>
          ) : (
            <div className="grid gap-2">
              {sources.map(source => (
                <div
                  key={source.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <span>{source.name}</span>
                    {source.typicalProteinGrams && (
                      <span className="text-sm text-muted-foreground">
                        ({source.typicalProteinGrams}g)
                      </span>
                    )}
                    {source.isAntiInflammatory && (
                      <Leaf className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => setDeleteId(source.id)}
                    aria-label={`Remove ${source.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this protein source?</AlertDialogTitle>
            <AlertDialogDescription>
              This won't affect existing meal logs that reference this food.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProteinSourceManager;
