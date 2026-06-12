#pragma once

#include "CoreMinimal.h"
#include "Subsystems/WorldSubsystem.h"

#include "GlasslineUILayerSubsystem.generated.h"

class APlayerController;
class UGlasslineUILayerWidget;

UCLASS()
class GLASSLINEUI_API UGlasslineUILayerSubsystem : public UTickableWorldSubsystem
{
	GENERATED_BODY()

public:
	virtual bool DoesSupportWorldType(EWorldType::Type WorldType) const override;
	virtual bool IsTickable() const override;
	virtual void Tick(float DeltaTime) override;
	virtual TStatId GetStatId() const override;

	UFUNCTION(BlueprintCallable, Category = "Glassline UI")
	UGlasslineUILayerWidget* ShowLayer(const FString& LayerName, const FString& Url, int32 ZOrder = 100);

	UFUNCTION(BlueprintCallable, Category = "Glassline UI")
	void HideLayer(const FString& LayerName);

	UFUNCTION(BlueprintCallable, Category = "Glassline UI")
	void SendToLayer(const FString& LayerName, const FString& MessageType, const FString& JsonPayload);

private:
	APlayerController* FindLocalPlayerController() const;
	void ArrangeLayer(UGlasslineUILayerWidget& Widget, APlayerController& PlayerController);

	UPROPERTY()
	TMap<FString, TObjectPtr<UGlasslineUILayerWidget>> Layers;
};
