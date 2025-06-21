"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCattle } from "@/lib/cattle-context"

interface ZoneSearchResultsProps {
  isOpen: boolean
  onClose: () => void
  results: any[]
  zoneName: string
}

export default function ZoneSearchResults({ 
  isOpen, 
  onClose, 
  results, 
  zoneName 
}: ZoneSearchResultsProps) {
  const { setSelectedCattleId } = useCattle()

  const handleCattleClick = (cattleId: string) => {
    setSelectedCattleId(cattleId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            🐄 Vacas encontradas en "{zoneName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {results.length} vaca{results.length !== 1 ? 's' : ''} encontrada{results.length !== 1 ? 's' : ''}
            </Badge>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">
                  No se encontraron vacas en esta zona
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.map((cattle) => (
                <Card 
                  key={cattle.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCattleClick(cattle.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={cattle.imageUrl || "/placeholder.svg"}
                        alt={cattle.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{cattle.name}</h3>
                        <p className="text-sm text-gray-600">{cattle.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={cattle.connected ? "default" : "destructive"}>
                            {cattle.connected ? "Conectada" : "Desconectada"}
                          </Badge>
                          {cattle.zoneId && (
                            <Badge variant="outline">
                              Zona: {cattle.zoneId}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Lat: {cattle.position[0]?.toFixed(4)}</p>
                        <p>Lng: {cattle.position[1]?.toFixed(4)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 