#include "GlasslineUILayerSubsystem.h"

#include "Blueprint/UserWidget.h"
#include "Engine/World.h"
#include "GameFramework/PlayerController.h"
#include "GlasslineUILayerWidget.h"

namespace
{
	FString GlasslineEscapeJsonString(FString Value)
	{
		Value.ReplaceInline(TEXT("\\"), TEXT("\\\\"));
		Value.ReplaceInline(TEXT("\""), TEXT("\\\""));
		Value.ReplaceInline(TEXT("\r"), TEXT("\\r"));
		Value.ReplaceInline(TEXT("\n"), TEXT("\\n"));
		Value.ReplaceInline(TEXT("\t"), TEXT("\\t"));
		return Value;
	}
}

bool UGlasslineUILayerSubsystem::DoesSupportWorldType(EWorldType::Type WorldType) const
{
	return WorldType == EWorldType::Game || WorldType == EWorldType::PIE;
}

bool UGlasslineUILayerSubsystem::IsTickable() const
{
	const UWorld* World = GetWorld();
	return !IsTemplate() && World && World->IsGameWorld();
}

void UGlasslineUILayerSubsystem::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	APlayerController* PlayerController = FindLocalPlayerController();
	if (!PlayerController)
	{
		return;
	}

	for (const TPair<FString, TObjectPtr<UGlasslineUILayerWidget>>& Pair : Layers)
	{
		if (Pair.Value && Pair.Value->IsInViewport())
		{
			ArrangeLayer(*Pair.Value, *PlayerController);
		}
	}
}

TStatId UGlasslineUILayerSubsystem::GetStatId() const
{
	RETURN_QUICK_DECLARE_CYCLE_STAT(UGlasslineUILayerSubsystem, STATGROUP_Tickables);
}

UGlasslineUILayerWidget* UGlasslineUILayerSubsystem::ShowLayer(const FString& LayerName, const FString& Url, int32 ZOrder)
{
	APlayerController* PlayerController = FindLocalPlayerController();
	if (!PlayerController || LayerName.IsEmpty())
	{
		return nullptr;
	}

	TObjectPtr<UGlasslineUILayerWidget>& Layer = Layers.FindOrAdd(LayerName);
	if (!Layer)
	{
		Layer = CreateWidget<UGlasslineUILayerWidget>(PlayerController, UGlasslineUILayerWidget::StaticClass());
	}

	if (!Layer)
	{
		return nullptr;
	}

	if (!Layer->IsInViewport())
	{
		Layer->AddToViewport(ZOrder);
	}

	ArrangeLayer(*Layer, *PlayerController);
	Layer->LoadGlasslineUrl(Url);
	return Layer;
}

void UGlasslineUILayerSubsystem::HideLayer(const FString& LayerName)
{
	if (TObjectPtr<UGlasslineUILayerWidget>* Layer = Layers.Find(LayerName))
	{
		if (*Layer)
		{
			(*Layer)->RemoveFromParent();
		}
	}
}

void UGlasslineUILayerSubsystem::SendToLayer(const FString& LayerName, const FString& MessageType, const FString& JsonPayload)
{
	TObjectPtr<UGlasslineUILayerWidget>* Layer = Layers.Find(LayerName);
	if (!Layer || !*Layer)
	{
		return;
	}

	const FString Message = FString::Printf(
		TEXT("{\"type\":\"%s\",\"payload\":%s}"),
		*GlasslineEscapeJsonString(MessageType),
		JsonPayload.IsEmpty() ? TEXT("null") : *JsonPayload);
	(*Layer)->SendJsonMessage(Message);
}

APlayerController* UGlasslineUILayerSubsystem::FindLocalPlayerController() const
{
	const UWorld* World = GetWorld();
	if (!World)
	{
		return nullptr;
	}

	for (FConstPlayerControllerIterator It = World->GetPlayerControllerIterator(); It; ++It)
	{
		APlayerController* PlayerController = It->Get();
		if (PlayerController && PlayerController->IsLocalController())
		{
			return PlayerController;
		}
	}

	return nullptr;
}

void UGlasslineUILayerSubsystem::ArrangeLayer(UGlasslineUILayerWidget& Widget, APlayerController& PlayerController)
{
	int32 Width = 0;
	int32 Height = 0;
	PlayerController.GetViewportSize(Width, Height);
	if (Width <= 0 || Height <= 0)
	{
		return;
	}

	Widget.SetAnchorsInViewport(FAnchors(0.0f, 0.0f, 0.0f, 0.0f));
	Widget.SetAlignmentInViewport(FVector2D::ZeroVector);
	Widget.SetPositionInViewport(FVector2D::ZeroVector, false);
	Widget.SetDesiredSizeInViewport(FVector2D(Width, Height));
}
